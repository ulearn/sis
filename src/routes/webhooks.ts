import { Router } from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../generated/prisma/client';
import { createXeroInvoiceFromHubSpot } from '../scripts/xero-invoice-commission';
import { getAuthedXero } from '../scripts/xero';
import { pushSisStudentIdToHubspot } from '../scripts/hubspot-contact-push';
import { applyChristmasClosures } from '../scripts/christmas-shunt';
import { syncArrivalFromFlight } from '../lib/transport-sync';
import { reconcileBookingCredit } from '../scripts/partner-credit-sync';
import { sendStudentEmail } from './email';
import { clearanceScripts } from '../scripts/clearance';

const HS_TOKEN = process.env.ACCESS_TOKEN!;

// On a freshly-opened invoice our Xero-invoice create races ahead of HubSpot
// DataSync's contact sync. SIS fires within ~2s of invoice-open, but DataSync
// only lands the Xero contact ~45s later (for a student it's gated on the now
// non-Draft invoice). createXeroInvoiceFromHubSpot then returns `no-contact`
// and, without a retry, the invoice never reaches Xero. We retry ONLY on
// `no-contact` — the open invoice guarantees DataSync WILL create the contact,
// so a short backoff lands it. Idempotent: the helper checks Xero for the
// invoice number before creating, so re-attempts never duplicate.
// NOTE: in-process fire-and-forget — a Passenger worker recycle mid-wait drops
// the pending retry. Acceptable for now; a persistent sweep can back it up later.
async function createXeroInvoiceWithRetry(
  args: { hubspotInvoiceId: string; hubspotDealId: string },
  label = '',
): Promise<any> {
  const delaysMs = [90_000, 180_000, 300_000]; // ~1.5m, 3m, 5m
  let result = await createXeroInvoiceFromHubSpot(args);
  for (let i = 0; i < delaysMs.length && result?.status === 'no-contact'; i++) {
    console.log(`[Xero Invoice]${label} no-contact — Xero contact not synced yet; retry ${i + 1}/${delaysMs.length} in ${delaysMs[i] / 1000}s`);
    await new Promise((r) => setTimeout(r, delaysMs[i]));
    result = await createXeroInvoiceFromHubSpot(args);
  }
  return result;
}
// HubSpot Contact property used to classify contacts (Student-B2C / Student-B2B / Employee / Agent Employee).
// Internal name in this portal is `type` (label "Type"). Override via env var only if the property is renamed.
const HS_CONTACT_TYPE_PROPERTY = process.env.HUBSPOT_CONTACT_TYPE_PROPERTY || 'type';

function hsGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.hubapi.com', path,
      headers: { 'Authorization': `Bearer ${HS_TOKEN}` },
    }, (res) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

function hsPatch(path: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.hubapi.com', path, method: 'PATCH',
      headers: { 'Authorization': `Bearer ${HS_TOKEN}`, 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch (e) { resolve({ status: res.statusCode, body: data }); } });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// Won-stage resolver — pipelineId → won stage id, cached per process. A deal's
// won stage MUST come from the deal's OWN pipeline; hardcoding 'closedwon' (the
// Direct/B2C won stage) drags B2B deals into the wrong pipeline. Resolves by
// stage metadata (isClosed + probability=1) so it survives pipeline edits.
// Mirrors fins/scripts/tm/escrow.js getWonStages.
let _wonStagesByPipeline: Record<string, string> | null = null;
async function resolveWonStage(pipeline: string): Promise<string | null> {
  if (!_wonStagesByPipeline) {
    const r = await hsGet('/crm/v3/pipelines/deals');
    _wonStagesByPipeline = {};
    for (const p of (r?.results || [])) {
      const won = (p.stages || []).find((s: any) => s.metadata && String(s.metadata.isClosed) === 'true' && Number(s.metadata.probability) === 1);
      if (won) _wonStagesByPipeline[p.id] = won.id;
    }
  }
  return _wonStagesByPipeline[pipeline] || null;
}

// ── Welcome Aboard onboarding email ──────────────────────────────────────────
// Fires ONCE per student the first time any of their bookings takes a payment
// (i.e. at the deal → WON moment). Prompts them to create their student account +
// sit the level test. NEVER mentions the LoA — that is a full-payment, manually-
// managed step, so it must not appear in a payment-triggered mail. All students,
// B2C + B2B. SKIPS: group bookings (the group WON flow is still WIP — e.g. the live
// Colegio Vitoria group), and missing / invalid / synthetic-placeholder emails
// (@ulearnstudent.com). RE-SENDS on subsequent payments UNTIL the student has
// created their account (Neil 2026-08-21): the mail's whole job is to get them to
// register + sit the level test, so keep nudging until an active student SisUser
// exists for their email — then stop. A 24h guard absorbs webhook retries and
// same-day double-payments so one event never double-fires. Non-fatal.
const WELCOME_ABOARD_SLUG = 'Welcome-Aboard';
function isRealStudentEmail(email?: string | null): boolean {
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return false;
  const domain = email.split('@')[1].toLowerCase();
  return domain !== 'ulearnstudent.com' && domain !== 'ulearn-student.com';
}
async function sendWelcomeAboardIfNew(prisma: PrismaClient, booking: any): Promise<void> {
  try {
    const student = booking?.student;
    if (!student?.id) return;
    if (booking.groupId) { console.log(`[Welcome] skip bk${booking.id} — group booking (${booking.groupId})`); return; }
    if (student.clearance) { console.log(`[Welcome] skip student ${student.id} — Seat Clearance placeholder`); return; }
    if (!isRealStudentEmail(student.email)) { console.log(`[Welcome] skip student ${student.id} — no/placeholder email (${student.email || 'none'})`); return; }
    const tpl = await prisma.documentTemplate.findFirst({
      where: { slug: WELCOME_ABOARD_SLUG, templateType: 'email' },
      select: { id: true, subject: true, htmlTemplate: true },
    });
    if (!tpl?.htmlTemplate) { console.warn(`[Welcome] template '${WELCOME_ABOARD_SLUG}' missing — skip`); return; }
    // Goal met? If an ACTIVE student account already exists for this email, they've
    // done what the mail asks — stop nudging. (Registration = SisUser userType
    // 'student', active, keyed by email — browser OR app.)
    const account = await prisma.sisUser.findFirst({
      where: { email: { equals: student.email, mode: 'insensitive' }, userType: 'student', active: true },
      select: { id: true },
    });
    if (account) { console.log(`[Welcome] skip student ${student.id} — already has an account`); return; }
    // Retry/double-payment guard: never re-send within 24h of the last send.
    const recent = await prisma.emailLog.findFirst({
      where: { studentId: student.id, templateId: tpl.id, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      select: { id: true },
    });
    if (recent) { console.log(`[Welcome] skip student ${student.id} — sent within last 24h`); return; }
    const fill = (s: string) => (s || '')
      .replace(/\{\{\s*student\.first_name\s*\}\}/g, student.firstName || 'there')
      .replace(/\{\{\s*student\.last_name\s*\}\}/g, student.lastName || '')
      .replace(/\{\{\s*student\.email\s*\}\}/g, student.email || '');
    await sendStudentEmail(prisma, {
      from: 'success@ulearnschool.com', fromName: 'ULearn Team',
      to: student.email, subject: fill(tpl.subject || 'Welcome to ULearn!'),
      html: fill(tpl.htmlTemplate), studentId: student.id, bookingId: booking.id, templateId: tpl.id,
    });
    console.log(`[Welcome] sent to student ${student.id} <${student.email}> (bk${booking.id})`);
  } catch (e: any) {
    console.warn(`[Welcome] send failed for bk${booking?.id}:`, e?.message || e);
  }
}

// Capture the customer-facing HubSpot share links (quote + invoice) onto the
// booking so the admin UI can render them as plain hyperlinks — no live API at
// render time. Fire-and-forget from /invoice-created (both the fresh-create and
// dedup paths). hs_invoice_link comes off the invoice object; hs_quote_link off
// the deal's first associated quote (99% of invoices have a quote behind them).
// Best-effort: any failure is logged and swallowed — it must never affect the
// webhook response or block Xero work.
async function captureReceiptLinks(
  prisma: PrismaClient,
  bookingId: number,
  invoiceId: string | null,
  dealId: string | null,
): Promise<void> {
  try {
    let invoiceUrl: string | null = null;
    let quoteUrl: string | null = null;
    if (invoiceId) {
      const inv = await hsGet(`/crm/v3/objects/invoices/${invoiceId}?properties=hs_invoice_link,hs_number`);
      const num = inv?.properties?.hs_number || '';
      // LifePass subscription masters (INV-####-Sub) are the internal €297×25
      // drawdown ledger, NOT the customer's receipt — never surface them. The
      // sub-invoice's invoice-created re-fire must not overwrite the primary
      // invoice link captured on the first fire (left null → undefined → no-op).
      if (!/-Sub$/i.test(num)) invoiceUrl = inv?.properties?.hs_invoice_link || null;
    }
    if (dealId) {
      const qa = await hsGet(`/crm/v3/objects/deals/${dealId}/associations/quotes`);
      const quoteId = qa?.results?.[0]?.id;
      if (quoteId) {
        const q = await hsGet(`/crm/v3/objects/quotes/${quoteId}?properties=hs_quote_link`);
        quoteUrl = q?.properties?.hs_quote_link || null;
      }
    }
    if (invoiceUrl || quoteUrl) {
      await prisma.booking.update({
        where: { id: bookingId },
        // undefined (not null) so a missing quote on a re-fire never wipes a link we already have
        data: {
          hubspotInvoiceUrl: invoiceUrl ?? undefined,
          hubspotQuoteUrl: quoteUrl ?? undefined,
        } as any,
      });
      console.log(`[Receipt Links] booking #${bookingId}: quote=${quoteUrl ? '✓' : '–'} invoice=${invoiceUrl ? '✓' : '–'}`);
    }
  } catch (e: any) {
    console.warn(`[Receipt Links] capture failed for booking ${bookingId}: ${e.message}`);
  }
}

function hsPost(path: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.hubapi.com', path, method: 'POST',
      headers: { 'Authorization': `Bearer ${HS_TOKEN}`, 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// Fetch the partner commission rate from a HubSpot Company. Returns null
// when the property is missing or zero. Lifted from documents.ts so the
// LifePass branch below can compute the correct order-level discount per
// invoice. CLAUDE.md agency rule: HubSpot is the authoritative source.
const HS_COMMISSION_PROP = process.env.HUBSPOT_COMMISSION_PROPERTY || 'commission';
async function fetchHubspotCommissionRate(hubspotCompanyId: string): Promise<number | null> {
  try {
    const data = await hsGet(`/crm/v3/objects/companies/${encodeURIComponent(hubspotCompanyId)}?properties=${HS_COMMISSION_PROP}`);
    const raw = data?.properties?.[HS_COMMISSION_PROP];
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    if (isNaN(n) || n <= 0) return null;
    // HubSpot stores commission as a decimal (0.3 = 30%) per current Workflow
    // convention. Accept legacy/typo formats too:
    //   < 1   → assume decimal:   0.3   → 30
    //   >= 50 → assume ×100 typo: 2500  → 25
    //   else  → assume integer %: 30    → 30
    if (n < 1)   return n * 100;
    if (n >= 50) return n / 100;
    return n;
  } catch {
    return null;
  }
}

// Create the LifePass second invoice on a deal — the €7,425 subscription
// snapshot that sits as a current asset alongside the €997 onboarding
// invoice. Called for any LifePass deal at /invoice-created time, from
// both the main and dedup paths (so a re-conversion of an existing
// booking still gets its sibling invoice created).
//
// Idempotent: scans the deal's existing invoices for the LPS product
// and no-ops if one already exists. So safe to call on every webhook
// fire — duplicates not possible.
//
// Errors are logged but never thrown — caller wraps it in fire-and-forget.
const LPS_PRODUCT_ID = '417138691301';
const LPS_QTY = 25;
const LPS_UNIT_PRICE = 297;

// Unique marker we plant in hs_comments on every LifePass subscription
// invoice we create. Two uses:
//   1. Idempotency inside this helper — bail if any invoice on the deal
//      already carries the marker (we've already created our subscription).
//   2. Entry guard in the dedup-path caller — when a webhook fires for an
//      invoice we just created, skip immediately (it's not the onboarding
//      invoice, it's ours coming back at us).
//
// The marker text MUST stay byte-for-byte identical to the value set in
// hs_comments at create-time below. If you change it, change both.
//
// History (2026-05-18): the prior idempotency check matched on the LPS
// product_id at the line-item level. When Plan B dropped hs_product_id
// from the line item (to escape the recurring-billing inheritance), the
// check stopped recognising our own invoices and a 14-invoice cascade
// happened in 4 min. The marker-in-comments signal is decoupled from
// product / line-item fields so future changes there can't repeat that.
const LPS_INVOICE_MARKER = 'LifePass subscription — internal accounting record';

// Helper to ask "is this invoice one we (the LifePass branch) created?"
// Used for both the idempotency loop and the entry guard. One API hop.
async function invoiceIsOurLifePassSub(invoiceId: string): Promise<boolean> {
  try {
    const inv = await hsGet(`/crm/v3/objects/invoices/${invoiceId}?properties=hs_comments`);
    const comments = String(inv?.properties?.hs_comments || '');
    return comments.includes(LPS_INVOICE_MARKER);
  } catch {
    return false;  // err on the side of "no" — caller decides what to do
  }
}

async function createLifePassSubscriptionInvoice(dealId: string, bookingTag: string, prismaClient: PrismaClient): Promise<void> {
  try {
    console.log(`[LifePass Invoice] checking deal ${dealId} for existing LifePass invoice (${bookingTag})`);

    // Idempotency — scan existing invoices on the deal; bail if any
    // already carry our marker in hs_comments. See LPS_INVOICE_MARKER.
    const existing = await hsGet(`/crm/v3/objects/deals/${dealId}/associations/invoices`);
    for (const inv of (existing.results || [])) {
      if (await invoiceIsOurLifePassSub(inv.id)) {
        console.log(`[LifePass Invoice] already exists on deal ${dealId} as invoice ${inv.id}; skipping`);
        return;
      }
    }

    // Resolve the STUDENT contact on the deal by filtering on HubSpot
    // contact `type` property. B2B deals can carry multiple contacts
    // (Student-B2B + Agent-Employee + parent), so we explicitly target
    // the one whose type starts with "student" — covers Student-B2C
    // (direct sale, almost always 1 contact) and Student-B2B (multi-
    // contact deals where the student must be picked out). The
    // subscription invoice is paid by the student directly via SEPA
    // regardless of channel, so the student is always the right
    // contact on the invoice.
    let contactId: string | null = null;
    const dealContactAssoc = await hsGet(`/crm/v3/objects/deals/${dealId}/associations/contacts`);
    const contactIds: string[] = (dealContactAssoc?.results || []).map((r: any) => String(r.id));
    if (contactIds.length === 1) {
      contactId = contactIds[0];
    } else if (contactIds.length > 1) {
      const batch = await hsPost('/crm/v3/objects/contacts/batch/read', {
        inputs: contactIds.map((id) => ({ id })),
        properties: [HS_CONTACT_TYPE_PROPERTY],
      });
      const studentContact = (batch?.results || []).find((c: any) => {
        const t = String(c?.properties?.[HS_CONTACT_TYPE_PROPERTY] || '').toLowerCase();
        return t.startsWith('student');  // matches Student-B2B AND Student-B2C
      });
      contactId = studentContact?.id ? String(studentContact.id) : null;
    }

    // Company on the deal (one company per deal — agency for B2B, none for B2C)
    const dealCompanyAssoc = await hsGet(`/crm/v3/objects/deals/${dealId}/associations/companies`);
    const companyId: string | null = dealCompanyAssoc?.results?.[0]?.id ? String(dealCompanyAssoc.results[0].id) : null;

    console.log(`[LifePass Invoice] resolved associations for deal ${dealId}: student-contact=${contactId || '(none)'} company=${companyId || '(none)'}`);

    // Pull course_start so we can anchor BOTH sides' dueDate to it.
    // Both the HubSpot invoice and the Xero invoice get dueDate =
    // course_start + 25 months. Rationale: LifePass = 25 × €297 monthly
    // installments via SEPA starting at course commencement, so month +25
    // is one billing cycle past the final installment. Xero's longest
    // reminder schedule fires 28 days before dueDate (e.g. 2028-03 for a
    // 2026-03 start) — by then the student is long gone (course = 35
    // calendar weeks including holidays). This is also tax/accounting
    // aligned: the full balance is contractually settled by month 25.
    //
    // Reminders only fire on overdue AUTHORISED invoices and Xero exposes
    // no per-invoice "Stop reminders" flag via API, so the far-future
    // dueDate is the lever. HubSpot side is cosmetic alignment — HubSpot
    // doesn't auto-email students from OPEN — but matching keeps the two
    // systems visually consistent for staff.
    const dealForDates = await hsGet(`/crm/v3/objects/deals/${dealId}?properties=course_start`);
    const courseStartStr = dealForDates?.properties?.course_start || null;
    const dueAnchor = courseStartStr ? new Date(courseStartStr) : new Date();
    if (!courseStartStr) {
      console.warn(`[LifePass Invoice] deal ${dealId} has no course_start; falling back to today for dueDate anchor`);
    }
    const subDueDate = new Date(dueAnchor.getFullYear(), dueAnchor.getMonth() + 25, dueAnchor.getDate());
    const subDueDateIso = subDueDate.toISOString().split('T')[0];

    console.log(`[LifePass Invoice] creating subscription invoice for deal ${dealId} (dueDate=${subDueDateIso})`);

    // 1. Create the invoice in DRAFT — we'll transition to OPEN at the
    //    end once line items + associations are in place. HubSpot may
    //    reject status=open on an empty invoice.
    const newInv = await hsPost('/crm/v3/objects/invoices', {
      properties: {
        hs_currency: 'EUR',
        hs_comments: 'LifePass subscription — internal accounting record. Do not send to student.',
        hs_due_date: subDueDateIso,
      },
    });
    if (!newInv?.id) {
      throw new Error('HubSpot invoice create returned no id: ' + JSON.stringify(newInv).slice(0, 300));
    }

    // 2. Associate invoice → deal / contact / company. Contact and company
    //    are best-effort — log but don't fail the whole flow if they're
    //    missing on the deal (shouldn't happen in practice).
    await hsPut(`/crm/v4/objects/invoices/${newInv.id}/associations/default/deals/${dealId}`, {});
    if (contactId) {
      await hsPut(`/crm/v4/objects/invoices/${newInv.id}/associations/default/contacts/${contactId}`, {});
    } else {
      console.warn(`[LifePass Invoice] no contact on deal ${dealId} — invoice will lack a contact association; DataSync will not push to Xero`);
    }
    if (companyId) {
      await hsPut(`/crm/v4/objects/invoices/${newInv.id}/associations/default/companies/${companyId}`, {});
    }

    // 3. Create the LifePass line item as a CUSTOM line — no
    //    hs_product_id reference. HubSpot persistently inherits the
    //    recurring config (monthly / P24M) from the linked LPS product
    //    even when we explicitly send null / "" for those properties at
    //    create time AND PATCH them to null post-create. The line ends
    //    up correctly priced (qty × price) but stuck as recurring, and
    //    the invoice can't transition to OPEN — "Payment does not
    //    support recurring Line Items". Dropping the product reference
    //    is the only reliable way to flatten it to a one-off.
    //
    //    Trade-off: line item won't appear under the LPS product in
    //    HubSpot reports. Acceptable here — this invoice is an internal
    //    accounting snapshot, not a sales-tracking artifact.
    const newLi = await hsPost('/crm/v3/objects/line_items', {
      properties: {
        quantity: LPS_QTY,
        price: LPS_UNIT_PRICE,
        name: `LifePass Subscription (${LPS_QTY} × €${LPS_UNIT_PRICE})`,
      },
    });
    if (!newLi?.id) {
      throw new Error('HubSpot line_item create returned no id: ' + JSON.stringify(newLi).slice(0, 300));
    }

    // 4. Associate line_item → invoice (v4 default)
    await hsPut(`/crm/v4/objects/line_items/${newLi.id}/associations/default/invoices/${newInv.id}`, {});

    // 5. Transition DRAFT → OPEN so DataSync picks it up and pushes to
    //    Xero. "Open" does NOT auto-email anyone — that requires an
    //    explicit "Send" action in HubSpot UI. So the student never
    //    receives this invoice unless someone clicks Send.
    //    HubSpot assigns the auto-incrementing hs_number (e.g. "INV-1065")
    //    during this transition.
    const openRes = await hsPatch(`/crm/v3/objects/invoices/${newInv.id}`, {
      properties: { hs_invoice_status: 'open' },
    });
    if (openRes?.status && openRes.status >= 300) {
      console.error(`[LifePass Invoice] PATCH to open FAILED status=${openRes.status} body=${JSON.stringify(openRes.body).slice(0,300)}`);
    } else {
      console.log(`[LifePass Invoice] invoice ${newInv.id} transitioned to OPEN`);
    }

    // 6. Rename hs_number → "<original>-Sub" so staff looking at the
    //    invoice list can't mistake this for a customer-facing invoice
    //    and accidentally hit Send. The €7,425 figure would be an
    //    unwelcome surprise for a student who's only contractually on
    //    the hook for the €297/month direct debit.
    const assigned = openRes?.body?.properties?.hs_number;
    const subNumber = assigned ? (/-Sub$/.test(assigned) ? assigned : `${assigned}-Sub`) : null;
    if (assigned && !/-Sub$/.test(assigned)) {
      const renameRes = await hsPatch(`/crm/v3/objects/invoices/${newInv.id}`, {
        properties: { hs_number: subNumber },
      });
      if (renameRes?.status && renameRes.status >= 300) {
        console.error(`[LifePass Invoice] rename ${assigned} → ${subNumber} FAILED status=${renameRes.status} body=${JSON.stringify(renameRes.body).slice(0,300)}`);
      } else {
        console.log(`[LifePass Invoice] renamed ${assigned} → ${subNumber}`);
      }
    }

    console.log(`[LifePass Invoice] created invoice ${newInv.id} with line_item ${newLi.id} (${LPS_QTY} × €${LPS_UNIT_PRICE} = €${LPS_QTY * LPS_UNIT_PRICE}) for deal ${dealId} (contact=${contactId || 'none'}, company=${companyId || 'none'})`);

    // 7. Push the -Sub invoice directly to Xero ourselves.
    //    We don't rely on DataSync for this — DataSync's behaviour around
    //    LifePass invoices is unreliable (parallel to the partner-commission
    //    pattern in createXeroInvoiceFromHubSpot). By owning the create we
    //    can also control the dueDate, which is our only API-level lever
    //    for suppressing reminders: Xero's public API exposes NO per-invoice
    //    "Stop reminders" flag (the web UI toggle is not in the API; the
    //    InvoiceReminder type is org-level enabled/disabled only). Reminders
    //    only fire on AUTHORISED + overdue invoices, so a dueDate set past
    //    the subscription term keeps reminders permanently silent for the
    //    student. We use today + 25 months to match LPS_QTY monthly slots.
    if (subNumber && contactId) {
      try {
        await pushLifePassSubToXero({ subNumber, hubspotContactId: contactId, dealId, dueDateIso: subDueDateIso });
      } catch (e: any) {
        console.error(`[LifePass Invoice] Xero push FAILED for ${subNumber}: ${e.message}`);
        if (e?.response?.body) {
          console.error(`[LifePass Invoice] Xero response body:`, JSON.stringify(e.response.body).slice(0, 1000));
        }
      }
    } else {
      console.warn(`[LifePass Invoice] skipping Xero push (subNumber=${subNumber || 'null'}, contactId=${contactId || 'null'})`);
    }

    // 8. Seed the payment_instalments ledger — 25 rows, one per monthly
    //    drawdown. This is the read side of the LifePass scheme
    //    (partner ledger / mobile profile / SIS booking display per
    //    .claude/docs/subs/subs.md). It is NOT an accounting object;
    //    the legal receivable remains the single -Sub master invoice
    //    in Xero. Each row carries the xeroInvoiceNumber as the join
    //    key so future Stripe Payment Links can stamp it as
    //    client_reference_id and recon (manual today, auto later) can
    //    match an incoming €297 back to the right master invoice.
    if (subNumber) {
      try {
        await seedLifePassInstalments({ dealId, subNumber, courseStartStr, dueAnchor, prismaClient });
      } catch (e: any) {
        console.error(`[LifePass Invoice] instalment seed FAILED for ${subNumber}: ${e.message}`);
      }
    }
  } catch (e: any) {
    console.error(`[LifePass Invoice] FAILED for deal ${dealId}: ${e.message}`);
    if (e?.response?.body) {
      console.error(`[LifePass Invoice] response body:`, JSON.stringify(e.response.body).slice(0, 1000));
    }
  }
}

// Seed the 25 monthly drawdown rows on payment_instalments for a LifePass
// booking. Idempotent via the unique (booking_id, sequence) constraint —
// re-runs do nothing on already-seeded sequences (createMany skipDuplicates).
//
// Anchor: instalment 1 due course_start, instalment 25 due course_start
// + 24 months. The Xero master invoice's dueDate (course_start + 25
// months) sits one cycle past the final instalment, so the master invoice
// is never overdue while drawdowns are still expected.
async function seedLifePassInstalments(input: {
  dealId: string;
  subNumber: string;
  courseStartStr: string | null;
  dueAnchor: Date;
  prismaClient: PrismaClient;
}): Promise<void> {
  const booking = await input.prismaClient.booking.findFirst({
    where: { hubspotDealId: input.dealId },
    select: { id: true },
  });
  if (!booking) {
    console.warn(`[LifePass Instalments] no SIS booking yet for deal ${input.dealId} — skipping seed (will retry when booking lands)`);
    return;
  }

  // Build the 25 rows. dueAnchor is the course_start (or today as
  // fallback when course_start missing — already logged upstream).
  const rows = [];
  for (let i = 1; i <= LPS_QTY; i++) {
    const due = new Date(input.dueAnchor.getFullYear(), input.dueAnchor.getMonth() + (i - 1), input.dueAnchor.getDate());
    rows.push({
      bookingId:         booking.id,
      xeroInvoiceNumber: input.subNumber,
      sequence:          i,
      dueDate:           due,
      amount:            LPS_UNIT_PRICE as any,
      currency:          'EUR',
    });
  }
  const result = await input.prismaClient.paymentInstalment.createMany({
    data: rows,
    skipDuplicates: true, // idempotent on (booking_id, sequence)
  });
  console.log(`[LifePass Instalments] seeded ${result.count}/${LPS_QTY} drawdowns for booking ${booking.id} (deal ${input.dealId}, ${input.subNumber})`);
}

// Create the Xero side of the LifePass -Sub invoice. Idempotent by
// invoiceNumber: if a Xero invoice with this -Sub number already exists
// (re-fire of the webhook, or DataSync managed to push it despite our
// expectation), we skip rather than create a duplicate. Contact is the
// student (matched by email — DataSync syncs HubSpot contacts to Xero
// keyed on email).
async function pushLifePassSubToXero(input: {
  subNumber: string;
  hubspotContactId: string;
  dealId: string;
  dueDateIso: string;
}): Promise<void> {
  // Resolve student email from HubSpot — needed to find the Xero contact.
  const contact = await hsGet(`/crm/v3/objects/contacts/${input.hubspotContactId}?properties=email,firstname,lastname`);
  const studentEmail = contact?.properties?.email || null;
  if (!studentEmail) {
    console.warn(`[LifePass Invoice] Xero push: no email on HubSpot contact ${input.hubspotContactId} for deal ${input.dealId}`);
    return;
  }

  const { xero, tenantId } = await getAuthedXero();

  // Idempotency: skip if a Xero invoice with this -Sub number already exists.
  const existingSearch = await xero.accountingApi.getInvoices(
    tenantId, undefined, undefined, undefined, undefined, [input.subNumber],
  );
  const existing = (existingSearch.body.invoices || []).find((i: any) => i.invoiceNumber === input.subNumber);
  if (existing) {
    console.log(`[LifePass Invoice] Xero already has ${input.subNumber} (${existing.invoiceID}); skipping create`);
    return;
  }

  // Look up the Xero contact by email. DataSync syncs HubSpot contacts to
  // Xero contacts keyed on email — so the student should already be there
  // from the parent INV-XXXX invoice flow.
  const contactSearch = await xero.accountingApi.getContacts(
    tenantId, undefined,
    `EmailAddress=="${studentEmail.replace(/"/g, '\\"')}"`,
  );
  const xeroContact = contactSearch.body.contacts?.[0];
  if (!xeroContact?.contactID) {
    console.warn(`[LifePass Invoice] Xero push: no Xero contact found for email ${studentEmail}; skipping`);
    return;
  }

  // dueDate is precomputed by the caller (course_start + 25 months) so both
  // HubSpot and Xero sides agree. Reminders only fire on overdue AUTHORISED
  // invoices and Xero exposes no per-invoice reminder toggle via API — so the
  // far-future dueDate is the lever that keeps reminders silent.
  const today = new Date().toISOString().split('T')[0];

  const created = await xero.accountingApi.createInvoices(tenantId, {
    invoices: [{
      type: 'ACCREC' as any,
      contact: { contactID: xeroContact.contactID } as any,
      date: today as any,
      dueDate: input.dueDateIso as any,
      invoiceNumber: input.subNumber,
      reference: `${input.subNumber} — LifePass subscription (internal record, reminders suppressed via dueDate)`,
      currencyCode: 'EUR' as any,
      status: 'AUTHORISED' as any,
      lineItems: [{
        description: `LifePass Subscription (${LPS_QTY} × €${LPS_UNIT_PRICE})`,
        quantity: LPS_QTY,
        unitAmount: LPS_UNIT_PRICE,
        accountCode: '100',
        taxType: 'NONE',
      }],
    }],
  });
  const ci = created.body.invoices?.[0];
  console.log(`[LifePass Invoice] Xero created ${input.subNumber} (${ci?.invoiceID}) total=€${ci?.total} dueDate=${input.dueDateIso} contact=${studentEmail}`);
}

function hsPut(path: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body || {});
    const req = https.request({
      hostname: 'api.hubapi.com', path, method: 'PUT',
      headers: { 'Authorization': `Bearer ${HS_TOKEN}`, 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// SKU prefix → SIS course category. Must stay in sync with the COURSE_SKU_MAP
// in hubapp/scripts/quote/autoQuote.js — that's where the line-item SKUs are
// minted on the way into HubSpot. Mismatches cause SIS to silently fail to
// capture the course (booking lands with 0 courses, accommodation only).
//
// Legacy prefixes (GIM, GIA, GE3, PVT) kept as fallbacks for historical data.
function skuToCourseCategory(sku: string): string | null {
  if (!sku) return null;
  const s = sku.toUpperCase();
  // Morning
  if (s.startsWith('GEM') || s === 'AYMORN') return 'MORNING';
  if (s.startsWith('GMPLS') || s.startsWith('GIM') || s === 'AYMORN+') return 'MORNING_PLUS';
  // Afternoon
  if (s.startsWith('GEA') || s === 'AYAFT') return 'AFTERNOON';
  if (s.startsWith('GAPLS') || s.startsWith('GIA') || s === 'AYAFT+') return 'AFTERNOON_PLUS';
  // Intensive
  if (s.startsWith('G30') || s.startsWith('GE3') || s.startsWith('INT')) return 'INTENSIVE';
  // Individual / Private lessons
  if (s.startsWith('121') || s.startsWith('PVT') || s.startsWith('PRIV')) return 'PRIVATE';
  // Exam prep (IELTS AM/PM, Cambridge FCE/CAE). No dedicated EXAM_PREP category
  // in SIS yet — map to MORNING/AFTERNOON based on time-of-day in the SKU.
  if (s.startsWith('IELTSAM') || s.startsWith('FCE') || s.startsWith('CAE')) return 'MORNING';
  if (s.startsWith('IELTSPM')) return 'AFTERNOON';
  // Academic Year renewals — legacy HubSpot products with their own SKUs
  // (not produced by autoQuote.js, so they appear when a returning student's
  // renewal deal flows through the webhook).
  if (s.startsWith('RNW-AM')) return 'MORNING';
  if (s.startsWith('RNW-PM')) return 'AFTERNOON';
  // LifePass (last — LP* could otherwise shadow other prefixes)
  if (s.startsWith('LP')) return s.includes('AFT') ? 'AFTERNOON' : 'MORNING';
  return null;
}

function skuToAccommType(sku: string): string | null {
  if (!sku) return null;
  const s = sku.toUpperCase();
  if (s.startsWith('HFS')) return 'Host Family';
  if (s.startsWith('ARP') || s.startsWith('ASU') || s.startsWith('AST') || s.startsWith('ASH')) return 'Apartment';
  return null;
}

// Classify line items that don't match a course/accom SKU.
// Mirrors the description-keyword logic in fidelo-fee-extractor.ts so HubSpot
// and Fidelo invoice line items end up in the same conceptual buckets.
type AuxKind = 'registration' | 'placement_fee' | 'pickup' | 'dropoff' | 'transfer' | 'exam' | 'insurance' | 'accommodation' | 'other';
function classifyAuxItem(name: string, description: string): AuxKind {
  const d = `${name || ''} ${description || ''}`.toLowerCase();
  if (/\bregistration\b/.test(d)) return 'registration';
  if (/\b(placement\s*fee|admission)\b/.test(d)) return 'placement_fee';
  if (/\b(pick[\s-]?up|arrival\s*transfer)\b/.test(d)) return 'pickup';
  if (/\b(drop[\s-]?off|departure\s*transfer)\b/.test(d)) return 'dropoff';
  if (/\b(transfer|airport)\b/.test(d)) return 'transfer';
  if (/\b(exam\s*fee|exam\b|test\s*fee|ielts|cambridge|fce|cae)\b/.test(d)) return 'exam';
  if (/\b(insurance|pel\b|health\s*cover)\b/.test(d)) return 'insurance';
  if (/\b(accomm|host\s*family|hotel|residence|apartment|homestay|room|lodging|board)\b/.test(d)) return 'accommodation';
  return 'other';
}

// True iff this SKU is an Academic Year renewal product. HubSpot models renewals
// as a separate discounted SKU (RNW-AM / RNW-PM) but the course delivered is
// identical to a first-year AY. We collapse to the canonical AY name and flag
// the BookingCourse with isRenewal=true so the SIS UI can show a "Renewal" badge.
function isRenewalSku(sku: string): boolean {
  const s = (sku || '').toUpperCase();
  return s.startsWith('RNW-AM') || s.startsWith('RNW-PM');
}

// Strip pricing tier from HubSpot product name → clean SIS course name.
// SKU is consulted so LifePass / AY products get the canonical SIS naming
// even when HubSpot sends a marketing-flavoured name or no name at all.
function cleanCourseName(hubspotName: string, category: string, sku?: string): string {
  const s = (sku || '').toUpperCase();
  // LifePass SKUs (LPMORN / LPAFT) → canonical "Life Pass Morning/Afternoon"
  if (s.startsWith('LP')) {
    return s.includes('AFT') ? 'Life Pass Afternoon' : 'Life Pass Morning';
  }
  // AY renewal SKUs (RNW-AM / RNW-PM) collapse to the canonical AY name —
  // the course itself is the same product, only the price differs.
  if (s.startsWith('RNW-')) {
    return s.startsWith('RNW-PM') ? 'Academic Year Afternoon' : 'Academic Year Morning';
  }
  // AY SKUs (AYMORN / AYAFT, with optional + suffix) → canonical "Academic Year ..."
  if (s.startsWith('AY')) {
    const aft = s.includes('AFT');
    const plus = s.includes('+');
    return `Academic Year ${aft ? 'Afternoon' : 'Morning'}${plus ? ' Plus' : ''}`;
  }
  // "General English AM | 1 - 5 Weeks" → "General English AM"
  // "Academic Year Afternoon (375 Hours)" → "Academic Year Afternoon"
  let name = hubspotName.replace(/\s*\|.*$/, '').replace(/\s*\(.*\)$/, '').trim();
  if (!name) {
    const names: Record<string, string> = {
      MORNING: 'General English Morning',
      MORNING_PLUS: 'General English Morning Plus',
      AFTERNOON: 'General English Afternoon',
      AFTERNOON_PLUS: 'General English Afternoon Plus',
      INTENSIVE: 'Intensive General English',
      PRIVATE: 'Private Lessons',
    };
    name = names[category] || 'Course';
  }
  return name;
}

function getHoursPerWeek(category: string): number | null {
  switch (category) {
    case 'MORNING': return 15;
    case 'MORNING_PLUS': return 20;
    case 'AFTERNOON': return 15;
    case 'AFTERNOON_PLUS': return 20;
    case 'INTENSIVE': return 30;
    default: return null;
  }
}

// In-memory guard against rapid double-apply on the same Xero invoice.
// Use case: user clicks "Apply €X" twice before HubSpot's hs_amount_paid
// has caught up (eventual consistency on the HubSpot side). Without this
// guard, the second click would re-detect the mismatch (HubSpot still shows
// 0 paid) and create a second duplicate Payment. We track which invoice
// numbers we've applied within the last RECENT_APPLY_WINDOW_MS and skip
// re-applies for those.
//
// Tradeoff: lost on SIS restart. If you restart SIS within 5 min of an apply,
// a second click within the window could still cause duplicate. For full
// safety we'd persist this to DB, but in-memory is fine for the rare case.
const recentApplies = new Map<string, number>();
const RECENT_APPLY_WINDOW_MS = 5 * 60 * 1000;

// Accommodation dates. ULearn host-family changeover is weekend-only (check in
// & out on Saturday). When a deal carries explicit accomm_start/accomm_end we use
// those (they're already weekend-aligned); otherwise we default the stay to the
// Saturday on/before the course start through the Saturday on/after the course end
// (7 nights/week) — NOT the Mon–Fri course dates, which clip the arrival/departure
// weekend nights. UTC math: these are stored as @db.Date (see memory: do date math
// in UTC or summer dates save a day early).
function saturdayOnOrBefore(d: Date): Date {
  const x = new Date(d); x.setUTCHours(0, 0, 0, 0);
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 1) % 7)); // Sat→0, Sun→1, … Fri→6
  return x;
}
function saturdayOnOrAfter(d: Date): Date {
  const x = new Date(d); x.setUTCHours(0, 0, 0, 0);
  x.setUTCDate(x.getUTCDate() + ((6 - x.getUTCDay() + 7) % 7));
  return x;
}
function resolveAccomDates(dp: any, courseStart: Date | null, courseEnd: Date | null): { start: Date; end: Date } {
  const cs = courseStart ?? new Date();
  const ce = courseEnd ?? courseStart ?? new Date();
  return {
    start: dp?.accomm_start ? new Date(dp.accomm_start) : saturdayOnOrBefore(cs),
    end:   dp?.accomm_end   ? new Date(dp.accomm_end)   : saturdayOnOrAfter(ce),
  };
}

// Collapse a peak/off-peak accom SPLIT into one stay. A HubSpot deal carries ONE accom
// stay (single accomm_start/end); autoQuote splits it into 2+ line items by peak-WEEK count
// purely for PRICING (quote-inv/autoQuote.js). SIS tracks the stay, not the pricing split —
// so line items sharing accommodationType|roomType|board become ONE row spanning the full
// window, with weeks + fee SUMMED. Rows of a different type stay separate (a genuine
// multi-booking — apartment then host family).
function mergeAccomRows(rows: any[]): any[] {
  const byKey = new Map<string, any>();
  for (const r of rows) {
    const key = `${r.accommodationType || ''}|${r.roomType || ''}|${r.board || ''}`;
    const prev = byKey.get(key);
    if (!prev) { byKey.set(key, { ...r }); continue; }
    prev.weeks = (prev.weeks || 0) + (r.weeks || 0);
    if (r.fee != null) prev.fee = (prev.fee || 0) + r.fee;
    if (r.startDate && (!prev.startDate || r.startDate < prev.startDate)) prev.startDate = r.startDate;
    if (r.endDate && (!prev.endDate || r.endDate > prev.endDate)) prev.endDate = r.endDate;
  }
  return [...byKey.values()];
}

// ── Peak-season detection ──────────────────────────────────────────────────
// CANONICAL windows live in data/peak-season.json (0-based month indices) so the
// hub quoter (autoQuote.js) and this webhook read the SAME source and can't drift.
// Loaded once; a missing/broken file falls back to the historic hardcoded windows
// (accom Jul-Sep, course Jul-Aug) so the webhook never breaks on a bad edit.
const PEAK_WINDOWS: { accom: { peakStartMonth: number; peakEndMonth: number }; course: { peakStartMonth: number; peakEndMonth: number } } = (() => {
  const fallback = { accom: { peakStartMonth: 6, peakEndMonth: 8 }, course: { peakStartMonth: 6, peakEndMonth: 7 } };
  try {
    const j = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'peak-season.json'), 'utf8'));
    return {
      accom:  { peakStartMonth: j.accom?.peakStartMonth  ?? fallback.accom.peakStartMonth,  peakEndMonth: j.accom?.peakEndMonth  ?? fallback.accom.peakEndMonth },
      course: { peakStartMonth: j.course?.peakStartMonth ?? fallback.course.peakStartMonth, peakEndMonth: j.course?.peakEndMonth ?? fallback.course.peakEndMonth },
    };
  } catch (e: any) {
    console.warn(`[peak-season] using fallback windows (data/peak-season.json unreadable: ${e.message})`);
    return fallback;
  }
})();

// Walk 7-day windows across [start,end]; count those passing `pass` (all weeks if omitted).
// Ported verbatim from autoQuote.js peakWeeksInRange so the split logic is identical.
function _walkWeeks(startISO: any, endISO: any, pass?: (ws: Date, we: Date) => boolean): number {
  const norm = (d: any) => (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) ? d.split('/').reverse().join('-') : d;
  const start = new Date(norm(startISO)); const end = new Date(norm(endISO));
  if (isNaN(+start) || isNaN(+end) || end < start) return 0;
  let count = 0; const ws = new Date(start);
  while (ws <= end) {
    const we = new Date(ws); we.setUTCDate(we.getUTCDate() + 6);
    if (!pass || pass(ws, we)) count++;
    ws.setUTCDate(ws.getUTCDate() + 7);
  }
  return count;
}
function peakWeeksInRange(startISO: any, endISO: any, peakStartMonth: number, peakEndMonth: number): number {
  return _walkWeeks(startISO, endISO, (ws, we) => {
    for (let y = ws.getUTCFullYear(); y <= we.getUTCFullYear(); y++) {
      const ps = new Date(Date.UTC(y, peakStartMonth, 1));
      const pe = new Date(Date.UTC(y, peakEndMonth + 1, 0));  // day 0 of next month = last day
      if (we >= ps && ws <= pe) return true;
    }
    return false;
  });
}

// TRUE iff an accom stay spans BOTH peak and off-peak (the exact condition under which
// autoQuote emits two accom line items). This is the canonical "is it a seasonal split?" test.
function accomStraddlesPeak(start: any, end: any): boolean {
  const w = PEAK_WINDOWS.accom;
  const peak = peakWeeksInRange(start, end, w.peakStartMonth, w.peakEndMonth);
  const total = _walkWeeks(start, end);
  return peak > 0 && peak < total;
}

// Is a multi-line-item accom set a peak/off-peak split of ONE continuous stay (→ merge),
// or genuinely separate stays (→ leave alone)? Two independent signals, either suffices:
//   1. SKU double-check — an explicit peak SKU (-P) alongside a non-peak SKU is definitive.
//   2. Canonical date check — the deal's accom dates span the peak boundary.
function isSeasonalAccomSplit(start: any, end: any, skus?: (string | null | undefined)[]): boolean {
  const list = (skus || []).map(s => String(s || '').trim().toUpperCase()).filter(Boolean);
  if (list.some(s => /-P$/.test(s)) && list.some(s => !/-P$/.test(s))) return true;
  return accomStraddlesPeak(start, end);
}

// Normalise the HubSpot deal `board` (meals) property to the SIS canonical set
// (Self Catering / Breakfast / Half Board / Full Board). HubSpot sends short
// forms — e.g. "Half", "Full", "SC" — as well as the hyphenated "Half-board".
// Without this the board never reaches SIS (it wasn't even fetched/mapped before)
// — the systemic "meals not showing in SIS" bug on host-family + apartment bookings.
function normAccomBoard(v?: string | null): string | null {
  if (!v) return null;
  const s = String(v).trim().toLowerCase();
  if (!s) return null;
  if (/^(half|hb\b|half[-\s]?board)/.test(s))                 return 'Half Board';
  if (/^(full|fb\b|full[-\s]?board)/.test(s))                 return 'Full Board';
  if (/^(b\s*&\s*b|bb\b|breakfast|bed.*breakfast)/.test(s))   return 'Breakfast';
  if (/^(self|sc\b|none|no\s*board|self[-\s]?cater)/.test(s)) return 'Self Catering';
  return v;  // unknown → pass through untouched (DB canonicaliser can still map)
}

// Re-sync an EXISTING booking's logistics from its HubSpot deal.
//
// The /invoice-created weblow re-fires whenever the invoice's amount-billed changes
// while it's Open (HubSpot re-enrolment). On a re-fire the booking already exists, so
// the handler early-returns ("already_exists") and historically did NO refresh — meaning
// line-item changes made AFTER the booking was first created (e.g. an accommodation added
// when the invoice was raised) never landed in SIS. This closes that gap.
//
// Policy — FILL GAPS ONLY (deliberately conservative). HubSpot is the source for the
// INITIAL enrolment, but backfilled / complex bookings (e.g. two sequential courses in
// one booking, which AutoQuote can't express) carry WRONG or split HubSpot data, so a
// blind overwrite corrupts good SIS data and can duplicate rows. Therefore:
//   • Course: CREATE only when the booking has NO course of that category; otherwise
//     fill only NULL dates on the existing row. Never overwrite a non-null date, never
//     touch fee/weeks, never create a second row of a category already present.
//   • Course LEVEL  → never touched (owned by the level-test workflow).
//   • Accommodation → CREATE only when the booking has NONE; otherwise fill only NULL
//     room/dates on the first row. Never add a second accommodation.
//   • Service window → only fills a NULL serviceStart/serviceEnd; never overwrites.
//   • Courses are never deleted (StudentClassAssignment.bookingCourseId FKs to
//     BookingCourse — a delete would orphan class assignments).
//   • Financials — RECONCILED on every fire (Neil 2026-07-10: the invoice is the
//     legal/financial/contractual agreement, so amountTotal + the component fees
//     — registration / placement / airport transfer / exam / insurance — must mirror it
//     the FIRST time AND every re-fire, not merely fill gaps). The ONE exception is
//     amountPaid: it is owned by the invoice-paid / payment-sync path, so amountOpen is
//     recomputed from it here but amountPaid itself is never written. Line items are read
//     from the INVOICE (the contract) when its id is known — it can carry items the deal
//     doesn't. Discrete fees (reg / placement) and the fee-bearing EXTRAS (transfer / exam /
//     insurance) are upserted so every invoice component is represented. Existing course/accom
//     per-row FEES are deliberately NOT overwritten: a SIS accom fee legitimately aggregates
//     several line items (host family + extra nights) and a split multi-course booking would
//     be misattributed — the authoritative total already carries the money.
// Net effect: logistics are gap-filled (safe no-op on messy/complex bookings) while the money
// — total, balance, reg/placement fees, and every fee-bearing extra — is aligned to the
// invoice. Course/accom DATE + existing-fee edits are not propagated (staff own those in SIS).
export async function resyncBookingLogistics(
  prisma: PrismaClient,
  bookingId: number,
  dealId: string,
  invoiceId?: string | null,
  forceAuthoritative = false,   // the /deal-resync webhook + cron pass true — being called IS the deliberate signal
): Promise<string[]> {
  const changes: string[] = [];

  // 1. Pull current deal props + line items from HubSpot.
  const dealProps = [
    'course_start', 'course_end', 'course_weeks',
    'accomm_type', 'room_type', 'board', 'accomm_start', 'accomm_end', 'accomm_weeks',
    'amount', 'airport_pickup', 'airport_dropoff', 'resync',
  ].join(',');
  const deal = await hsGet(`/crm/v3/objects/deals/${dealId}?properties=${dealProps}`);
  const dp = deal.properties || {};
  // AUTHORITATIVE ReSync: deal.resync = "Yes" is set by the sales "ReSync Deal" workflow — a
  // human deliberately re-inscribed the deal, so HubSpot wins: overwrite any DIFFERING course/
  // accom/service dates + entries (delta-checked, so unchanged fields aren't rewritten). Routine
  // webhook fires (flag unset) stay conservative gap-fill so they can NEVER undo SIS-only
  // operational shunts (visa +4-week approval shunt, holiday shunts). The flag is cleared after.
  const authoritative = forceAuthoritative || /^yes$/i.test(String(dp.resync || '').trim());
  const courseStart = dp.course_start ? new Date(dp.course_start) : null;
  const courseEnd = dp.course_end ? new Date(dp.course_end) : null;
  const courseWeeks = parseInt(dp.course_weeks) || null;

  // LifePass subscription masters (INV-####-Sub, the internal €297×N receivable) must NEVER
  // drive a booking's financials or line items — they're a separate receivable that the
  // invoice-paid / balance paths deliberately skip (see balance-semantics memory). If this
  // fire is for a -Sub invoice, drop the invoice id: reconciliation then falls back to the
  // deal for conservative logistics gap-fill only, and the financial force-sync (gated on a
  // real invoice below) is skipped entirely.
  let effectiveInvoiceId: string | null = invoiceId || null;
  if (effectiveInvoiceId) {
    try {
      const invMeta = await hsGet(`/crm/v3/objects/invoices/${effectiveInvoiceId}?properties=hs_number`);
      if (/-Sub$/i.test(invMeta?.properties?.hs_number || '')) {
        console.log(`[resync] invoice ${effectiveInvoiceId} is a LifePass -Sub master — skipping financial reconcile for booking #${bookingId}`);
        effectiveInvoiceId = null;
      }
    } catch { /* keep it; downstream lookups fall back to the deal on error */ }
  }

  // Read line items from the INVOICE when we have its id — the invoice is the contract and
  // can carry items the deal does not (e.g. an airport transfer added at invoicing time;
  // deal and invoice hold SEPARATE line-item objects). Fall back to the deal otherwise.
  let liAssoc: any = { results: [] };
  if (effectiveInvoiceId) {
    try { liAssoc = await hsGet(`/crm/v3/objects/invoices/${effectiveInvoiceId}/associations/line_items`); }
    catch (e: any) { console.warn(`[resync] invoice ${effectiveInvoiceId} line-item lookup failed, falling back to deal: ${e.message}`); }
  }
  if (!(liAssoc.results || []).length) {
    liAssoc = await hsGet(`/crm/v3/objects/deals/${dealId}/associations/line_items`);
  }
  const lineItemIds = (liAssoc.results || []).map((r: any) => r.id);
  let lineItems: any[] = [];
  if (lineItemIds.length > 0) {
    const liData = await hsPost('/crm/v3/objects/line_items/batch/read', {
      inputs: lineItemIds.map((id: string) => ({ id })),
      properties: ['name', 'hs_sku', 'quantity', 'price', 'amount', 'description'],
    });
    lineItems = liData.results || [];
  }

  // 2. Build the desired course + accommodation shape (mirrors the create path).
  const desiredCourses: any[] = [];
  const desiredAccom: any[] = [];
  const desiredAccomSkus: string[] = [];   // for the SKU peak/off-peak double-check
  for (const li of lineItems) {
    const p = li.properties || {};
    const sku = p.hs_sku || '';
    const amount = parseFloat(p.amount) || 0;
    const cat = skuToCourseCategory(sku);
    if (cat) {
      desiredCourses.push({
        category: cat,
        name: cleanCourseName(p.name || '', cat, sku),
        startDate: courseStart,
        endDate: courseEnd || courseStart,
        weeks: courseWeeks || parseInt(p.quantity) || 1,
        hoursPerWeek: getHoursPerWeek(cat),
        fee: amount,
        isRenewal: isRenewalSku(sku),
      });
      continue;
    }
    const at = skuToAccommType(sku);
    if (at) {
      if (sku) desiredAccomSkus.push(sku);
      const ad = resolveAccomDates(dp, courseStart, courseEnd);
      desiredAccom.push({
        accommodationType: at, roomType: dp.room_type || null, board: normAccomBoard(dp.board),
        startDate: ad.start, endDate: ad.end,
        // THIS line item's own quantity (its weeks) — mergeAccomRows sums the split back to the
        // stay total. Using the deal total here would make every split row carry the full weeks.
        weeks: parseInt(p.quantity) || parseInt(dp.accomm_weeks) || 1,
        fee: amount,
      });
    }
  }
  // Deal-props fallback (richer than the SKU matcher — keeps the specific product name
  // e.g. "City Centre Apartment" + room type, and covers SKUs the matcher misses).
  if (desiredAccom.length === 0 && dp.accomm_type) {
    const ad = resolveAccomDates(dp, courseStart, courseEnd);
    desiredAccom.push({
      accommodationType: dp.accomm_type, roomType: dp.room_type || null, board: normAccomBoard(dp.board),
      startDate: ad.start, endDate: ad.end,
      weeks: parseInt(dp.accomm_weeks) || 1, fee: null,
    });
  }

  // 3. Load existing sub-rows.
  const existing = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true, serviceStart: true, serviceEnd: true,
      amountTotal: true, amountPaid: true, regFee: true, placementFee: true,
      courses: { select: { id: true, category: true, startDate: true, endDate: true, weeks: true, fee: true } },
      accommodations: { select: { id: true, accommodationType: true, roomType: true, board: true, startDate: true, endDate: true, weeks: true, fee: true } },
    },
  });
  if (!existing) return changes;

  // 4. Courses — conservative fills a NULL date; AUTHORITATIVE overwrites a DIFFERING date
  // (+ weeks). Still create at most one row per wholly-missing category; never duplicate.
  //
  // AUTHORITATIVE single-course recategorisation (Neil 2026-08-13): when the booking has
  // exactly ONE course and the deal/invoice now resolves to exactly ONE course of a
  // DIFFERENT category, the source was deliberately re-inscribed to correct a
  // mis-categorised course (classic case: a renewal quote built from the wrong AM/PM
  // product, so the line-item SKU says PM while it should be AM). Flip the existing row
  // IN PLACE — category + name (+ dates/weeks/hours) — rather than leaving the stale one
  // and ADDING a duplicate of the new category (the old behaviour, which is why a plain
  // ReSync "did nothing" for a wrong course type). Restricted to the unambiguous 1:1 case
  // so genuine multi-course splits (a morning + an afternoon course) are never disturbed,
  // and only under the authoritative signal. Logged loudly: the student may have moved
  // between the AM/PM class pools, so DOS must re-check the class assignment (SCA rows
  // stay attached to this course id — they are NOT auto-moved).
  if (
    authoritative &&
    existing.courses.length === 1 &&
    desiredCourses.length === 1 &&
    String(existing.courses[0].category) !== String(desiredCourses[0].category)
  ) {
    const ex = existing.courses[0];
    const dc = desiredCourses[0];
    const data: any = { category: dc.category, name: dc.name };
    if (dc.startDate) data.startDate = dc.startDate;
    if (dc.endDate) data.endDate = dc.endDate;
    if (dc.weeks) data.weeks = dc.weeks;
    if (dc.hoursPerWeek) data.hoursPerWeek = dc.hoursPerWeek;
    await prisma.bookingCourse.update({ where: { id: ex.id }, data });
    changes.push(`course#${ex.id} RECATEGORISED ${ex.category}→${dc.category} (authoritative — RE-CHECK class assignment / AM↔PM pool)`);
  } else {
    const existingByCat = new Map<string, typeof existing.courses[number]>();
    for (const c of existing.courses) if (!existingByCat.has(c.category as any)) existingByCat.set(c.category as any, c);
    const createdCats = new Set<string>();
    for (const dc of desiredCourses) {
      const ex = existingByCat.get(dc.category);
      if (ex) {
        const data: any = {};
        if (dc.startDate && (ex.startDate == null || (authoritative && +ex.startDate !== +dc.startDate))) data.startDate = dc.startDate;
        if (dc.endDate && (ex.endDate == null || (authoritative && +ex.endDate !== +dc.endDate))) data.endDate = dc.endDate;
        if (authoritative && dc.weeks && (ex as any).weeks !== dc.weeks) data.weeks = dc.weeks;
        if (Object.keys(data).length) {
          await prisma.bookingCourse.update({ where: { id: ex.id }, data });
          changes.push(`course#${ex.id}(${dc.category}) ${authoritative ? 'set' : 'fill'}:${Object.keys(data).join(',')}`);
        }
      } else if (!createdCats.has(dc.category)) {
        createdCats.add(dc.category);
        const created = await prisma.bookingCourse.create({
          data: {
            bookingId, name: dc.name, category: dc.category,
            startDate: dc.startDate, endDate: dc.endDate, weeks: dc.weeks,
            hoursPerWeek: dc.hoursPerWeek, fee: dc.fee, active: true, isRenewal: dc.isRenewal,
          } as any,
        });
        changes.push(`course+${created.id}(${dc.category})`);
      }
    }
  }

  // 5. Accommodation — SIS tracks the STAY, not the peak/off-peak pricing split. Same-type
  // line items collapse to ONE row (see mergeAccomRows). Rows of DIFFERENT accommodationType
  // are a genuine multi-booking (apartment then host family) → left to humans.
  const desiredMerged = mergeAccomRows(desiredAccom);              // one row per type|room|board
  const existingTypes = new Set(existing.accommodations.map(a => a.accommodationType).filter(Boolean));
  if (existing.accommodations.length === 0) {
    for (const da of desiredMerged) {
      const created = await prisma.bookingAccommodation.create({
        data: {
          bookingId, accommodationType: da.accommodationType, roomType: da.roomType, board: da.board,
          startDate: da.startDate, endDate: da.endDate, weeks: da.weeks, fee: da.fee, active: true,
        } as any,
      });
      changes.push(`accom+${created.id}(${da.accommodationType})`);
    }
  } else if (desiredMerged.length > 0) {
    if (existingTypes.size > 1) {
      // Genuine multi-booking (two different accom types) — the deal can't express it; leave alone.
      changes.push(`accom skipped (${existing.accommodations.length} rows / ${existingTypes.size} types — true multi-booking, manual)`);
    } else if (authoritative) {
      const da = desiredMerged[0];
      const rows = [...existing.accommodations].sort((a, b) => a.id - b.id);
      const survivor = rows[0];
      // Multiple same-type rows are only a peak/off-peak split of ONE stay when the deal's accom
      // dates span the peak boundary (canonical check) OR the line items carry a peak+off-peak SKU
      // pair (double-check) — the exact condition autoQuote split under. Otherwise they may be two
      // genuinely separate stays → leave them for a human, don't blanket-merge.
      const seasonalSplit = rows.length <= 1
        || isSeasonalAccomSplit((da as any).startDate, (da as any).endDate, desiredAccomSkus);
      if (rows.length > 1 && !seasonalSplit) {
        changes.push(`accom left (${rows.length} same-type rows but not a seasonal split — dates don't span peak & no peak SKU; manual)`);
      } else {
      // Single-type stay, possibly split across N rows → COLLAPSE to one survivor (lowest id),
      // delete the extras, and set the survivor to the merged desired (full span, summed weeks/fee).
      for (const ex of rows.slice(1)) {
        await prisma.bookingAccommodation.delete({ where: { id: ex.id } });
        changes.push(`accom-${ex.id}(merged→#${survivor.id})`);
      }
      const wasSplit = rows.length > 1;                            // merged rows away → survivor must own the whole stay
      const data: any = {};
      if (da.roomType && survivor.roomType !== da.roomType) data.roomType = da.roomType;
      if (da.board && (survivor as any).board !== da.board) data.board = da.board;
      if (da.accommodationType && survivor.accommodationType !== da.accommodationType) data.accommodationType = da.accommodationType;
      if (da.startDate && +(survivor.startDate as any) !== +da.startDate) data.startDate = da.startDate;
      if (da.endDate && +(survivor.endDate as any) !== +da.endDate) data.endDate = da.endDate;
      if (da.weeks && (wasSplit || (survivor as any).weeks !== da.weeks)) data.weeks = da.weeks;
      if (da.fee != null && (wasSplit || Number(survivor.fee) !== Number(da.fee))) data.fee = da.fee;
      if (Object.keys(data).length) {
        await prisma.bookingAccommodation.update({ where: { id: survivor.id }, data });
        changes.push(`accom#${survivor.id} set:${Object.keys(data).join(',')}`);
      }
      }
    } else {
      // Conservative (routine webhook): NEVER delete/add — just fill NULL room/board/dates on
      // the first row. Collapsing a split is a deliberate ReSync action, not a side effect.
      const da = desiredMerged[0];
      const ex = [...existing.accommodations].sort((a, b) => a.id - b.id)[0];
      const data: any = {};
      if (da.roomType && ex.roomType == null) data.roomType = da.roomType;
      if (da.board && (ex as any).board == null) data.board = da.board;
      if (da.startDate && ex.startDate == null) data.startDate = da.startDate;
      if (da.endDate && ex.endDate == null) data.endDate = da.endDate;
      if (Object.keys(data).length) {
        await prisma.bookingAccommodation.update({ where: { id: ex.id }, data });
        changes.push(`accom#${ex.id} fill:${Object.keys(data).join(',')}`);
      }
    }
  }

  // 6. Service window — conservative fills a NULL; AUTHORITATIVE overwrites when it differs.
  {
    const allStarts = [courseStart, ...desiredAccom.map(a => a.startDate)].filter(Boolean) as Date[];
    const allEnds = [courseEnd, ...desiredAccom.map(a => a.endDate)].filter(Boolean) as Date[];
    const wantStart = allStarts.length ? new Date(Math.min(...allStarts.map(d => d.getTime()))) : null;
    const wantEnd = allEnds.length ? new Date(Math.max(...allEnds.map(d => d.getTime()))) : null;
    const data: any = {};
    if (wantStart && (existing.serviceStart == null || (authoritative && +existing.serviceStart !== +wantStart))) data.serviceStart = wantStart;
    if (wantEnd && (existing.serviceEnd == null || (authoritative && +existing.serviceEnd !== +wantEnd))) data.serviceEnd = wantEnd;
    if (Object.keys(data).length) {
      await prisma.booking.update({ where: { id: bookingId }, data });
      changes.push(`service ${authoritative ? 'set' : 'fill'}:${Object.keys(data).join(',')}`);
    }
  }

  // Clear the ReSync flag so it can't linger and let a later ROUTINE fire overwrite dates
  // (which would undo SIS-only shunts). One deliberate resync = one authoritative apply.
  if (authoritative) {
    try { await hsPatch(`/crm/v3/objects/deals/${dealId}`, { properties: { resync: '' } }); changes.push('resync-flag-cleared'); }
    catch (e: any) { console.warn(`[resync] failed to clear resync flag on deal ${dealId}: ${e.message}`); }
  }

  // Steps 7-8 (financial + extras force-sync) require a REAL invoice as the source of truth.
  // No invoice id, or a LifePass -Sub master (cleared above) → stop here having done only the
  // conservative logistics gap-fill, exactly the pre-2026-07 behavior. Financials are NEVER
  // force-synced off the deal alone.
  if (!effectiveInvoiceId) return changes;

  // 7. FINANCIALS — reconcile the total + component fees to the invoice on every fire.
  //    Authoritative total = invoice hs_amount_billed, else the line-item sum, else the deal
  //    amount (mirrors the create path's `hsAmount`). amountPaid is NOT written (owned by the
  //    invoice-paid path); amountOpen is recomputed from it.
  const lineTotal = lineItems.reduce((s, li) => s + (parseFloat(li.properties?.amount) || 0), 0);
  let invoiceBilled = 0;
  try {
    const inv = await hsGet(`/crm/v3/objects/invoices/${effectiveInvoiceId}?properties=hs_amount_billed`);
    invoiceBilled = parseFloat(inv.properties?.hs_amount_billed) || 0;
  } catch (e: any) {
    console.warn(`[resync] invoice ${effectiveInvoiceId} amount lookup failed, falling back to line-item sum: ${e.message}`);
  }
  const authoritativeTotal = invoiceBilled || lineTotal || parseFloat(dp.amount) || 0;

  // Classify the non-course / non-accom line items into fee buckets (mirrors the create path).
  let regFee = 0, placementFee = 0, pickupFee = 0, dropoffFee = 0, transferFee = 0, examFee = 0, insuranceFee = 0;
  for (const li of lineItems) {
    const p = li.properties || {};
    const sku = p.hs_sku || '';
    if (skuToCourseCategory(sku) || skuToAccommType(sku)) continue;
    const amt = parseFloat(p.amount) || 0;
    switch (classifyAuxItem(p.name || '', p.description || '')) {
      case 'registration':   regFee       += amt; break;
      case 'placement_fee':  placementFee += amt; break;
      case 'pickup':         pickupFee    += amt; break;
      case 'dropoff':        dropoffFee   += amt; break;
      case 'transfer':       transferFee  += amt; break;
      case 'exam':           examFee      += amt; break;
      case 'insurance':      insuranceFee += amt; break;
    }
  }
  // Ambiguous "airport / transfer" line item → split by the deal's pickup/dropoff flags,
  // defaulting to pickup when neither is set (mirrors the create path).
  if (transferFee > 0) {
    const isTrueL = (v: any) => String(v ?? '').toLowerCase() === 'true';
    const wantPickup = isTrueL(dp.airport_pickup), wantDropoff = isTrueL(dp.airport_dropoff);
    if (wantPickup && wantDropoff) { pickupFee += transferFee / 2; dropoffFee += transferFee / 2; }
    else if (wantDropoff)          { dropoffFee += transferFee; }
    else                           { pickupFee  += transferFee; }
  }

  const finData: any = {};
  if (authoritativeTotal > 0 && Math.abs(Number(existing.amountTotal ?? 0) - authoritativeTotal) > 0.005) {
    finData.amountTotal = authoritativeTotal;
    finData.amountOpen = Math.round((authoritativeTotal - Number(existing.amountPaid ?? 0)) * 100) / 100;
  }
  const newReg = regFee > 0 ? regFee : null;
  const newPlace = placementFee > 0 ? placementFee : null;
  if (Number(existing.regFee ?? 0) !== Number(newReg ?? 0)) finData.regFee = newReg;
  if (Number(existing.placementFee ?? 0) !== Number(newPlace ?? 0)) finData.placementFee = newPlace;
  if (Object.keys(finData).length) {
    await prisma.booking.update({ where: { id: bookingId }, data: finData });
    changes.push(`financials:${Object.keys(finData).join(',')}${finData.amountTotal != null ? `(total→${authoritativeTotal})` : ''}`);
  }

  // 8. EXTRAS — every fee-bearing invoice component must be represented. Upsert by type
  //    (create if missing, align fee if present). Non-destructive: an extra that exists in
  //    SIS but isn't on the invoice (e.g. staff-added airport pickup) is left in place.
  const existingExtras = await prisma.bookingExtra.findMany({ where: { bookingId }, select: { id: true, extraType: true, fee: true } });
  const extraByType = new Map(existingExtras.map(e => [e.extraType, e]));
  const upsertExtra = async (extraType: string, fee: number) => {
    const ex = extraByType.get(extraType);
    if (ex) {
      if (Math.abs(Number(ex.fee ?? 0) - fee) > 0.005) {
        await prisma.bookingExtra.update({ where: { id: ex.id }, data: { fee } });
        changes.push(`extra#${ex.id}(${extraType}) fee→${fee}`);
      }
    } else {
      const created = await prisma.bookingExtra.create({ data: { bookingId, extraType, fee, active: true } as any });
      changes.push(`extra+${created.id}(${extraType})`);
    }
  };
  if (pickupFee    > 0) await upsertExtra('AIRPORT_PICKUP', pickupFee);
  if (dropoffFee   > 0) await upsertExtra('AIRPORT_DROPOFF', dropoffFee);
  if (examFee      > 0) await upsertExtra('EXAM_FEE', examFee);
  if (insuranceFee > 0) await upsertExtra('INSURANCE', insuranceFee);

  // If a transfer extra was just represented and the student's flight is
  // already on file, seed the arrival datetime so the job appears in Transport
  // without a manual re-entry (fill-only-if-empty).
  if (pickupFee > 0 || dropoffFee > 0) {
    const bk = await prisma.booking.findUnique({ where: { id: bookingId }, select: { studentId: true } });
    const seeded = await syncArrivalFromFlight(prisma, bk?.studentId);
    if (seeded.length) changes.push(`arrival-seeded×${seeded.length}`);
  }

  return changes;
}

export function webhookRoutes(prisma: PrismaClient) {
  const router = Router();

  // ── Deliberate ReSync trigger (instant) ─────────────────────────────────
  // The HubSpot "ReSync Deal" workflow POSTs here → we authoritatively re-pull the
  // deal onto its SIS booking immediately (overwrite differing dates/entries, clear
  // the flag). This is the real-time path; the hourly cron-deal-resync is the safety
  // net that catches any that don't reach here. Shared-secret auth (public mount).
  //   URL: /sis/api/webhooks/deal-resync?key=<RESYNC_WEBHOOK_SECRET>&dealId={{deal.hs_object_id}}
  // dealId also accepted from the POST body (objectId / dealId / properties.hs_object_id).
  const handleDealResync = async (req: any, res: any) => {
    try {
      const secret = process.env.RESYNC_WEBHOOK_SECRET;
      if (!secret) return res.status(500).json({ error: 'server misconfigured (no RESYNC_WEBHOOK_SECRET)' });
      const key = req.query.key || req.header('x-resync-secret');
      if (key !== secret) return res.status(401).json({ error: 'unauthorized' });
      const b = req.body || {};
      const dealId = String(req.query.dealId || b.dealId || b.objectId || b.properties?.hs_object_id || b.hs_object_id || '').trim();
      if (!dealId) return res.status(400).json({ error: 'dealId required' });
      const booking = await prisma.booking.findFirst({ where: { hubspotDealId: dealId }, select: { id: true } });
      if (!booking) { console.warn(`[deal-resync webhook] no SIS booking for deal ${dealId}`); return res.status(404).json({ error: 'no SIS booking for deal ' + dealId }); }
      const changes = await resyncBookingLogistics(prisma, booking.id, dealId, null, true);
      console.log(`[deal-resync webhook] deal ${dealId} → booking #${booking.id}: ${changes.length ? changes.join('; ') : 'no deltas'}`);
      res.json({ ok: true, bookingId: booking.id, changes });
    } catch (e: any) { console.error('[deal-resync webhook] error:', e?.message || e); res.status(500).json({ error: String(e?.message || e) }); }
  };
  // ── Seat Clearance eligibility mirror ────────────────────────────────────────
  // A native HubSpot workflow (triggered whenever the partner's `clearance` property
  // changes — "is known") POSTs here to keep SIS Agency.clearanceEligible in sync with
  // HubSpot. Match the partner by company id, the partner's contact id, or email.
  // Body: an identifier (hubspotCompanyId | hubspotContactId/contactId | email) + the value
  // (clearance_eligible | clearance). The workflow sends the field's CURRENT value dynamically,
  // so this is a strict mirror: true/Yes → eligible; false/No/unset/empty → NOT eligible.
  router.post('/clearance-eligible', async (req, res) => {
    try {
      const b: any = req.body || {};
      const p = b.properties || {};
      const contactId = String(b.hubspotContactId || b.contactId || b.vid || b.objectId || p.hs_object_id || '').trim() || null;
      const companyId = String(b.hubspotCompanyId || b.companyId || '').trim() || null;
      const email = String(b.email || p.email || '').trim().toLowerCase() || null;
      const clrRaw = String(b.clearance_eligible ?? b.clearance ?? p.clearance_eligible ?? p.clearance ?? '').trim().toLowerCase();
      // STRICT mirror of the HubSpot field's current value (the workflow sends it dynamically):
      // only true/Yes → eligible; false/No/unset/empty → NOT eligible. So clearing the flag
      // in HubSpot revokes access here — keeps both sides perfectly in sync.
      const eligible = ['yes', 'true'].includes(clrRaw);

      let agency: any = null;
      if (companyId) agency = await prisma.agency.findFirst({ where: { hubspotCompanyId: companyId } });
      if (!agency && contactId) {
        const u = await prisma.sisUser.findFirst({ where: { hubspotContactId: contactId }, select: { agencyId: true } });
        if (u?.agencyId) agency = await prisma.agency.findUnique({ where: { id: u.agencyId } });
      }
      if (!agency && email) {
        const u = await prisma.sisUser.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, select: { agencyId: true } });
        if (u?.agencyId) agency = await prisma.agency.findUnique({ where: { id: u.agencyId } });
        if (!agency) agency = await prisma.agency.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
      }
      // Fallback: resolve the contact's associated HubSpot company → Agency. Covers a partner
      // contact with no SIS portal login yet (no SisUser row) — every eligible agency has a
      // stored hubspotCompanyId.
      if (!agency && contactId) {
        try {
          const ca = await hsGet(`/crm/v3/objects/contacts/${contactId}/associations/companies`);
          const compId = ca?.results?.[0]?.id || ca?.results?.[0]?.toObjectId;
          if (compId) agency = await prisma.agency.findFirst({ where: { hubspotCompanyId: String(compId) } });
        } catch (e: any) { console.warn(`[clearance-eligible] company-assoc lookup failed: ${e?.message || e}`); }
      }
      if (!agency) {
        console.warn(`[clearance-eligible] no agency match (contact=${contactId} company=${companyId} email=${email})`);
        return res.status(404).json({ ok: false, error: 'agency not found' });
      }
      await prisma.agency.update({ where: { id: agency.id }, data: { clearanceEligible: eligible } });
      console.log(`[clearance-eligible] agency ${agency.id} (${agency.name}) → clearanceEligible=${eligible}`);
      res.json({ ok: true, agencyId: agency.id, clearanceEligible: eligible });
    } catch (e: any) {
      console.error('[clearance-eligible] error:', e.message);
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  router.post('/deal-resync', handleDealResync);
  router.get('/deal-resync', handleDealResync);   // GET too, in case the workflow can only do a URL hit

  // HubSpot invoice created → create Student + Booking in SIS
  // Triggered by HubSpot workflow when quote is converted to invoice
  router.post('/invoice-created', async (req, res) => {
    try {
      const { invoiceId, dealId } = req.body;

      if (!invoiceId && !dealId) {
        return res.status(400).json({ error: 'invoiceId or dealId required' });
      }

      // Resolve deal ID if not provided
      let resolvedDealId = dealId;
      if (!resolvedDealId && invoiceId) {
        const assoc = await hsGet(`/crm/v3/objects/invoices/${invoiceId}/associations/deals`);
        resolvedDealId = assoc.results?.[0]?.id;
      }
      if (!resolvedDealId) {
        return res.status(404).json({ error: 'No deal found for this invoice' });
      }

      // Check if booking already exists for THIS invoice / student.
      // Family-deal safety: a single deal can carry multiple Student-B2C
      // contacts (parent + child, siblings — Hughes Pimentel family case
      // 2026-05-28). Each invoice on the deal belongs to ONE of those students,
      // not all of them. So we dedup against:
      //   (1) the same hubspotInvoiceId (re-fire of the same event), OR
      //   (2) the same deal AND same student as the invoice's contact.
      // Pure dealId dedup would attach Bernardo's invoice to Julia's booking.
      let invoiceContactId: string | null = null;
      if (invoiceId) {
        try {
          const ic = await hsGet(`/crm/v4/objects/invoices/${invoiceId}/associations/contacts`);
          invoiceContactId = ic.results?.[0]?.toObjectId ? String(ic.results[0].toObjectId) : null;
        } catch (e: any) {
          console.warn(`[Invoice Created] invoice→contact lookup failed for ${invoiceId}: ${e.message}`);
        }
      }
      let existingBooking = invoiceId
        ? await prisma.booking.findFirst({ where: { hubspotInvoiceId: invoiceId } as any })
        : null;
      if (!existingBooking && invoiceContactId) {
        existingBooking = await prisma.booking.findFirst({
          where: {
            hubspotDealId: resolvedDealId,
            student: { is: { hubspotContactId: invoiceContactId } },
          } as any,
        });
      }
      if (existingBooking) {
        // Self-heal: if this webhook fire carries a different invoice ID than
        // we have on file (typical "delete invoice, re-convert" testing cycle,
        // or production cleanup), update the booking row to point at the new
        // invoice. Without this, downstream reconciliation looks up a deleted
        // invoice and silently no-ops.
        if (invoiceId && existingBooking.hubspotInvoiceId !== invoiceId) {
          try {
            await prisma.booking.update({
              where: { id: existingBooking.id },
              data: { hubspotInvoiceId: invoiceId } as any,
            });
            console.log(`[Invoice Created] booking #${existingBooking.id} hubspotInvoiceId updated: ${existingBooking.hubspotInvoiceId || '(null)'} → ${invoiceId}`);
          } catch (e: any) {
            console.warn(`[Invoice Created] failed to update hubspotInvoiceId on booking ${existingBooking.id}: ${e.message}`);
          }
        }

        // Re-sync logistics from the deal before responding. This is the path a
        // re-fire takes (the workflow re-triggers on any amount-billed change while
        // Open), and historically it refreshed NOTHING — so line items added after
        // the booking was first created (e.g. accommodation tacked on at invoicing)
        // never reached SIS. resyncBookingLogistics is idempotent and only writes
        // diffs; it never deletes courses (protects class assignments) or touches
        // financials. Awaited so the refresh is reliable; failures log, don't 500.
        try {
          const synced = await resyncBookingLogistics(prisma, existingBooking.id, resolvedDealId, invoiceId || null);
          if (synced.length) {
            console.log(`[Invoice Created] (dedup-path) re-synced booking #${existingBooking.id} from deal ${resolvedDealId}: ${synced.join('; ')}`);
          }
        } catch (e: any) {
          console.error(`[Invoice Created] (dedup-path) re-sync failed for booking ${existingBooking.id}: ${e.message}`);
        }

        // Booking already created on a prior webhook fire. Respond fast, then
        // still ensure the Xero invoice exists with the commission line — this
        // is the path Neil hit when re-converting a deleted invoice; the dedup
        // would otherwise short-circuit before any Xero work runs.
        res.json({ status: 'already_exists', bookingId: existingBooking.id });
        // Refresh the stored quote/invoice share links (handles re-converted /
        // re-issued invoices — the link token changes, so re-capture).
        captureReceiptLinks(prisma, existingBooking.id, invoiceId || null, resolvedDealId).catch(() => {});
        if (invoiceId) {
          (async () => {
            try {
              console.log(`[Xero Invoice] (dedup-path) starting for hubspotInvoiceId=${invoiceId}, dealId=${resolvedDealId}`);
              const result = await createXeroInvoiceWithRetry({
                hubspotInvoiceId: invoiceId,
                hubspotDealId: resolvedDealId,
              });
              console.log(`[Xero Invoice] (dedup-path) ${result.status}:`, JSON.stringify(result));
            } catch (e: any) {
              console.error(`[Xero Invoice] (dedup-path) FAILED for invoice ${invoiceId}: ${e.message}`);
              if (e?.response?.body) {
                console.error(`[Xero Invoice] response body:`, JSON.stringify(e.response.body).slice(0, 1000));
              }
            }
          })();
        }

        // Also fire the LifePass second-invoice creation on the dedup path.
        // Needed for the "re-convert an existing deal as LifePass" testing
        // cycle — on a re-fire the main path is skipped, so without this
        // the subscription invoice never gets created. The helper is
        // idempotent (scans the deal's invoices first) so calling it on
        // every dedup fire is safe.
        //
        // ENTRY GUARD: if the invoice that just fired the webhook is one
        // we created ourselves (carries our LifePass marker in
        // hs_comments), bail immediately. Defense-in-depth against the
        // cascade pattern where creating an invoice via the HubSpot API
        // fires invoice-created back at us, which without this guard
        // would re-enter the LifePass helper. The in-helper idempotency
        // is the primary protection; this guard saves an API hop and
        // catches it earlier.
        (async () => {
          try {
            if (invoiceId && await invoiceIsOurLifePassSub(invoiceId)) {
              console.log(`[LifePass Invoice] (dedup-path) skipping — invoice ${invoiceId} is one of ours (carries LPS marker)`);
              return;
            }
            const dealLite = await hsGet(`/crm/v3/objects/deals/${resolvedDealId}?properties=course_type`);
            const ct = String(dealLite?.properties?.course_type || '');
            if (/^lifepass\s*/i.test(ct)) {
              await createLifePassSubscriptionInvoice(resolvedDealId, `booking #${existingBooking.id} (dedup-path)`, prisma);
            }
          } catch (e: any) {
            console.error(`[LifePass Invoice] (dedup-path) course_type fetch failed for deal ${resolvedDealId}: ${e.message}`);
          }
        })();
        return;
      }

      // Get deal details (expanded to cover course, accommodation, extras, territory)
      const dealProps = [
        'dealname', 'dealstage', 'amount', 'territory',
        'course_type', 'course_start', 'course_end', 'course_weeks',
        'private_hours', 'junior_pack',
        'accomm_type', 'room_type', 'board', 'accomm_start', 'accomm_end', 'accomm_weeks',
        'airport_pickup', 'airport_pickup_time',
        'airport_dropoff', 'airport_dropoff_time',
        'exam_fee', 'exam_type',
        'insurance',
        // 'challenge' = HubSpot Deal select field. Null when the booking
        // is not part of any challenge; "KickStart" or "CashBack" when it
        // is. Mirrored to Booking.hubspotChallenge below and gates the
        // student-profile Challenges tab.
        'challenge',
      ].join(',');
      const deal = await hsGet(`/crm/v3/objects/deals/${resolvedDealId}?properties=${dealProps}`);

      // Resolve the STUDENT contact on the deal — same logic for B2B and B2C.
      // Family-style B2C deals (parent + child) and B2B deals (student + partner staff)
      // both have multiple contacts, so the workflow's `type` flag isn't a reliable
      // proxy for "single vs multiple contacts on the deal".
      //   1. ONE contact → take it.
      //   2. Multiple contacts → batch-fetch the `type` property and:
      //        - exclude any whose type contains "employee" (parents, agents, staff)
      //        - prefer any whose type starts with "student"
      //        - fall back to the Student-B2B / Student-B2C association label
      //        - last resort: first non-excluded contact
      //   The student doesn't need to be tagged for this to work — only the
      //   non-students do. Handles cases like Imelda-the-aunt paying for
      //   Margherita & Francesca where Imelda is `Employee` and the kids are
      //   `Student-B2B` / `Student-B2C`.
      let resolvedContactId: string | null = null;
      let resolvedCompanyId: string | null = null;
      let resolvedCompanyName: string | null = null;
      // Agency domain — captured for the defensive contact-domain filter below.
      // When the deal resolves to an agency Company, any contact whose email
      // domain matches it is almost certainly agency staff (not the student).
      let resolvedCompanyDomain: string | null = null;
      // Sole-trader agent: an Employee-typed contact on the deal who's effectively
      // the agency for this enrolment, even when no Company is associated. Captured
      // here so the agency lookup below can fall back to a contact-primary agency.
      let agentContactId: string | null = null;

      // Resolve the agency company on the deal (if any). Moved above contact
      // resolution so `resolvedCompanyDomain` is available as a tiebreaker when
      // multiple contacts on the deal are tagged as students (mis-tagged agents
      // get filtered out by domain match). Empty results just mean it's a direct
      // B2C and `agencyId` stays null. Per the agency-data rule in CLAUDE.md, we
      // store only id/name/hubspotCompanyId locally — commission rate stays in
      // HubSpot.
      try {
        const companyAssocV4 = await hsGet(`/crm/v4/objects/deals/${resolvedDealId}/associations/companies`);
        const companyAssocs: any[] = companyAssocV4.results || [];
        if (companyAssocs.length > 0) {
          resolvedCompanyId = String(companyAssocs[0].toObjectId);
          const company = await hsGet(`/crm/v3/objects/companies/${resolvedCompanyId}?properties=name,domain`);
          resolvedCompanyName = company?.properties?.name || null;
          resolvedCompanyDomain = (company?.properties?.domain || '').toLowerCase().trim() || null;
        }
      } catch (e: any) {
        console.warn(`[Invoice Created] Failed to resolve company on deal ${resolvedDealId}: ${e.message}`);
      }

      const contactAssocV4 = await hsGet(`/crm/v4/objects/deals/${resolvedDealId}/associations/contacts`);
      const contactAssocs: any[] = contactAssocV4.results || [];

      if (contactAssocs.length === 1) {
        resolvedContactId = String(contactAssocs[0].toObjectId);
      } else if (contactAssocs.length > 1) {
        let candidates = contactAssocs.slice();

        try {
          const ids = contactAssocs.map(a => ({ id: String(a.toObjectId) }));
          const batch = await hsPost('/crm/v3/objects/contacts/batch/read', {
            inputs: ids,
            properties: [HS_CONTACT_TYPE_PROPERTY, 'email'],
          });
          const typeById = new Map<string, string>();
          const emailById = new Map<string, string>();
          for (const c of batch.results || []) {
            typeById.set(String(c.id), String(c.properties?.[HS_CONTACT_TYPE_PROPERTY] || '').toLowerCase());
            emailById.set(String(c.id), String(c.properties?.email || '').toLowerCase().trim());
          }
          // Substring match — covers "Employee", "Agent Employee", any future "*-employee" variant.
          const employees = candidates.filter(a => /employee/.test(typeById.get(String(a.toObjectId)) || ''));
          const nonEmployees = candidates.filter(a => !/employee/.test(typeById.get(String(a.toObjectId)) || ''));
          // Remember the first employee — this becomes the sole-trader agent if no
          // Company is associated to the deal.
          if (employees.length > 0) agentContactId = String(employees[0].toObjectId);
          if (nonEmployees.length > 0) candidates = nonEmployees;
          else console.warn(`[Invoice Created] deal ${resolvedDealId}: all ${contactAssocs.length} contacts tagged as employee — skipping exclusion`);

          // Defensive agency-domain filter. When a contact's HubSpot `type` is
          // wrong (e.g. an agent contact mis-tagged Student-B2B), employee
          // exclusion above doesn't catch them and they look identical to the
          // real student. If the deal has an agency Company with a domain, drop
          // candidates whose email matches that domain — they're almost
          // certainly agency staff. Only applies when it would NOT empty
          // candidates entirely (so a deal with only on-domain contacts still
          // resolves rather than 404-ing).
          if (candidates.length > 1 && resolvedCompanyDomain) {
            const offDomain = candidates.filter(a => {
              const email = emailById.get(String(a.toObjectId)) || '';
              const at = email.indexOf('@');
              const domain = at >= 0 ? email.slice(at + 1) : '';
              return domain !== resolvedCompanyDomain;
            });
            if (offDomain.length > 0 && offDomain.length < candidates.length) {
              console.log(`[Invoice Created] deal ${resolvedDealId}: dropping ${candidates.length - offDomain.length} candidate(s) matching agency domain "${resolvedCompanyDomain}" — suspected mis-tagged agency staff`);
              candidates = offDomain;
            }
          }

          // If still multiple, prefer one explicitly tagged Student-*
          if (candidates.length > 1) {
            const explicitStudent = candidates.find(a => (typeById.get(String(a.toObjectId)) || '').startsWith('student'));
            if (explicitStudent) resolvedContactId = String(explicitStudent.toObjectId);
          } else if (candidates.length === 1) {
            resolvedContactId = String(candidates[0].toObjectId);
          }
        } catch (e: any) {
          console.warn(`[Invoice Created] contact type fetch failed for deal ${resolvedDealId}: ${e.message}`);
        }

        // Fallback: Student-B2B / Student-B2C association label
        if (!resolvedContactId) {
          for (const a of candidates) {
            const labels = (a.associationTypes || []).map((t: any) => (t.label || '').toLowerCase());
            if (labels.includes('student-b2b') || labels.includes('student-b2c')) {
              resolvedContactId = String(a.toObjectId);
              break;
            }
          }
        }

        // Last-resort fallback
        if (!resolvedContactId) {
          resolvedContactId = String(candidates[0].toObjectId);
          console.warn(`[Invoice Created] deal ${resolvedDealId}: no employee exclusion / student tag / label match worked — falling back to ${resolvedContactId}`);
        }
      }

      if (!resolvedContactId) {
        return res.status(404).json({ error: 'No contact found on deal' });
      }

      const contact = await hsGet(`/crm/v3/objects/contacts/${resolvedContactId}?properties=firstname,lastname,email,phone,mobilephone,country,date_of_birth,nationality,level,quiz_score,hs_additional_emails,clearance`);
      const cp = contact.properties || {};

      // Get line items
      const liAssoc = await hsGet(`/crm/v3/objects/deals/${resolvedDealId}/associations/line_items`);
      const lineItemIds = (liAssoc.results || []).map((r: any) => r.id);

      let lineItems: any[] = [];
      if (lineItemIds.length > 0) {
        const liData = await hsPost('/crm/v3/objects/line_items/batch/read', {
          inputs: lineItemIds.map((id: string) => ({ id })),
          properties: ['name', 'hs_sku', 'quantity', 'price', 'amount', 'description'],
        });
        lineItems = liData.results || [];
      }

      // Get invoice details
      let invoiceAmount = 0;
      if (invoiceId) {
        const inv = await hsGet(`/crm/v3/objects/invoices/${invoiceId}?properties=hs_amount_billed`);
        invoiceAmount = parseFloat(inv.properties?.hs_amount_billed) || 0;
      }

      // Create or find student
      let student = await prisma.student.findFirst({ where: { hubspotContactId: resolvedContactId } });
      if (!student && cp.email) {
        student = await prisma.student.findFirst({ where: { email: cp.email } });
      }

      // Parse quiz score from HubSpot — stored as string like "65%" or "65", we need an Int
      const quizScoreRaw = String(cp.quiz_score || '').trim();
      const quizScore = quizScoreRaw ? (parseInt(quizScoreRaw.replace(/[^0-9]/g, '')) || null) : null;
      const nationality = (cp.nationality || '').trim() || null;
      const level = (cp.level || '').trim() || null;
      // HubSpot keeps alternate addresses in hs_additional_emails (semicolon-separated).
      // Mirror the raw string so a returning student who re-books under a different
      // address still resolves to the same SIS record. SIS `email` stays the primary.
      const additionalEmails = (cp.hs_additional_emails || '').trim() || null;

      if (!student) {
        student = await prisma.student.create({
          data: {
            firstName: cp.firstname || 'Unknown',
            lastName: cp.lastname || 'Unknown',
            email: cp.email || '',
            phone: cp.phone || null,
            phoneMobile: cp.mobilephone || null,
            nationality,
            // First booking (a brand-new student is always on their first):
            // seed the level from the HubSpot quiz `level`, else default A2 so
            // the LoA never generates blank. Feeds the Learning/LMS side too.
            currentLevel: level || 'A2',
            quizScore,
            quizDate: quizScore !== null ? new Date() : null,
            additionalEmails,
            hubspotContactId: resolvedContactId,
            hubspotDealId: resolvedDealId,
            // Seat Clearance placeholder student — mirror the HubSpot Contact flag so
            // onboarding/Welcome emails are suppressed (see sendWelcomeAboardIfNew).
            clearance: cp.clearance === 'Yes' || cp.clearance === 'true',
          } as any,
        });
      } else {
        // Update only the fields we just looked up; don't wipe existing data.
        const updateData: any = {};
        if (!student.hubspotContactId) updateData.hubspotContactId = resolvedContactId;
        if (!student.hubspotDealId) updateData.hubspotDealId = resolvedDealId;
        // Alternate emails are HubSpot-authoritative — refresh whenever the contact
        // carries a value that differs from what we hold (handles a student adding a
        // second address in HubSpot after their SIS record already existed).
        if (additionalEmails && (student as any).additionalEmails !== additionalEmails) {
          updateData.additionalEmails = additionalEmails;
        }
        if (nationality && !student.nationality) updateData.nationality = nationality;
        if (level && !student.currentLevel) updateData.currentLevel = level;
        if (quizScore !== null && !student.quizScore) {
          updateData.quizScore = quizScore;
          updateData.quizDate = new Date();
        }
        // Clearance is HubSpot-authoritative — keep SIS in lockstep with the contact flag
        // (sync both ways so a redeemed/reassigned seat clears it too).
        const clr = cp.clearance === 'Yes' || cp.clearance === 'true';
        if ((student as any).clearance !== clr) updateData.clearance = clr;
        if (Object.keys(updateData).length > 0) {
          await prisma.student.update({ where: { id: student.id }, data: updateData });
        }
      }

      // Write the SIS student id back into the HubSpot contact's `student_id`
      // so the TM checkout prefills the "Student number" field. Fire-and-forget.
      pushSisStudentIdToHubspot(resolvedContactId, student.id, HS_TOKEN);

      // Level — FIRST booking only. The LoA reads booking.course_level
      // (bookingCourse.level), so mirror the student's level onto the first
      // booking's course(s): HubSpot quiz `level`, else A2 default, so the LoA
      // is never generated without one. Keep student + booking in lockstep.
      // Subsequent bookings are deliberately left untouched (Neil: only the
      // first matters — that's when the LoA is generated).
      const _priorBookings = await prisma.booking.count({ where: { studentId: student.id } });
      const isFirstBooking = _priorBookings === 0;
      const effectiveLevel = level || student.currentLevel || 'A2';
      if (isFirstBooking && student.currentLevel !== effectiveLevel) {
        await prisma.student.update({ where: { id: student.id }, data: { currentLevel: effectiveLevel } });
        student.currentLevel = effectiveLevel;
      }

      // Map line items to courses and accommodation
      const courses: any[] = [];
      const accommodations: any[] = [];
      const accomSkus: string[] = [];   // for the SKU peak/off-peak double-check
      let totalAmount = 0;

      const dp = deal.properties || {};
      // course_start/end absent (e.g. accounting-only backfill invoices where the
      // deal's course fields were never filled) → leave the dates BLANK, never
      // default to today. A wrong "starts today" date actively misleads the DOS
      // (rosters/arrivals); null surfaces honestly as "no arrival date". All
      // three date columns (booking serviceStart/End, bookingCourse, accom) are
      // nullable and their readers null-guard (e.g. classes.ts noArrivalDate bucket).
      const courseStart = dp.course_start ? new Date(dp.course_start) : null;
      const courseEnd = dp.course_end ? new Date(dp.course_end) : null;
      const courseWeeks = parseInt(dp.course_weeks) || null;

      // Per-classification accumulators for non-course/non-accom SKU line items.
      // These get applied to Booking.regFee/placementFee and BookingExtra.fee
      // after the loop. Mirrors the buckets in fidelo-fee-extractor.ts so the
      // two import paths produce comparable shape.
      let regFeeTotal = 0;
      let placementFeeTotal = 0;
      let pickupFeeTotal = 0;
      let dropoffFeeTotal = 0;
      let transferFeeTotal = 0;   // ambiguous "transfer" / "airport" — split to pickup/dropoff later
      let examFeeTotal = 0;
      let insuranceFeeTotal = 0;
      let accomFallbackFee = 0;   // description-matched accom rows when SKU scan misses

      for (const li of lineItems) {
        const p = li.properties;
        const sku = p.hs_sku || '';
        const amount = parseFloat(p.amount) || 0;
        totalAmount += amount;

        const courseCategory = skuToCourseCategory(sku);
        if (courseCategory) {
          courses.push({
            name: cleanCourseName(p.name || '', courseCategory, sku),
            category: courseCategory,
            startDate: courseStart,
            endDate: courseEnd || courseStart,
            weeks: courseWeeks || parseInt(p.quantity) || 1,
            hoursPerWeek: getHoursPerWeek(courseCategory),
            fee: amount,
            active: true,
            isRenewal: isRenewalSku(sku),
            // First booking only: mirror the student level (quiz or A2 default)
            // so the LoA's {booking.course_level} token isn't blank. Subsequent
            // bookings keep level null (left to the level-test workflow).
            level: isFirstBooking ? effectiveLevel : null,
          });
          continue;
        }

        const accommType = skuToAccommType(sku);
        if (accommType) {
          // Use the deal's explicit accom dates (weekend-aligned); fall back to a
          // Sat→Sat window around the course — never the raw Mon–Fri course dates,
          // which clip the arrival/departure weekend nights.
          const ad = resolveAccomDates(dp, courseStart, courseEnd);
          if (sku) accomSkus.push(sku);
          accommodations.push({
            accommodationType: accommType,
            roomType: dp.room_type || null,
            board: normAccomBoard(dp.board),
            startDate: ad.start,
            endDate: ad.end,
            // THIS line item's own quantity (its weeks); mergeAccomRows below sums the
            // peak/off-peak split back to the stay total (ASH-P×5 + ASH×3 → one 8w row).
            weeks: parseInt(p.quantity) || parseInt(dp.accomm_weeks) || 1,
            fee: amount,
            active: true,
          });
          continue;
        }

        // No SKU match — classify by name/description so reg fees, placement
        // fees, and extras stop getting silently merged into amountTotal.
        const kind = classifyAuxItem(p.name || '', p.description || '');
        switch (kind) {
          case 'registration':   regFeeTotal       += amount; break;
          case 'placement_fee':  placementFeeTotal += amount; break;
          case 'pickup':         pickupFeeTotal    += amount; break;
          case 'dropoff':        dropoffFeeTotal   += amount; break;
          case 'transfer':       transferFeeTotal  += amount; break;
          case 'exam':           examFeeTotal      += amount; break;
          case 'insurance':      insuranceFeeTotal += amount; break;
          case 'accommodation':  accomFallbackFee  += amount; break;
          // 'other' — already counted in totalAmount, no per-row destination
        }
      }

      // Collapse a peak/off-peak accom split (same-type line items) into ONE stay row — SIS tracks
      // the stay, not the pricing split (which stays in HubSpot + Xero). Only when this is genuinely
      // a SEASONAL split: the deal's accom dates span the peak boundary (canonical check) OR a peak
      // SKU (-P) sits alongside its off-peak base (double-check). If not, leave the rows as-is —
      // they may be two genuinely separate stays (mergeAccomRows keeps different types apart anyway).
      if (accommodations.length > 1) {
        const ad = resolveAccomDates(dp, courseStart, courseEnd);
        if (isSeasonalAccomSplit(ad.start, ad.end, accomSkus)) {
          const merged = mergeAccomRows(accommodations);
          accommodations.splice(0, accommodations.length, ...merged);
        }
      }

      // If the SKU scan didn't find an accommodation but the deal explicitly has
      // `accomm_type` set, create one from the deal properties directly. This is
      // more reliable than SKU parsing and handles the accommodation types partners
      // submit via the portal.
      if (accommodations.length === 0 && dp.accomm_type) {
        // Accom dates stay REQUIRED (host-payment billing keys off them), so they
        // must never be null. Fall back to the course window, and only as a last
        // resort to today — unlike the course/service dates, a placed bed needs a
        // concrete billing window.
        const ad = resolveAccomDates(dp, courseStart ?? null, courseEnd ?? null);
        const accommWeeks = parseInt(dp.accomm_weeks) || null;
        accommodations.push({
          accommodationType: dp.accomm_type,
          roomType: dp.room_type || null,
          board: normAccomBoard(dp.board),
          startDate: ad.start,
          endDate: ad.end,
          weeks: accommWeeks || 1,
          fee: accomFallbackFee > 0 ? accomFallbackFee : null,
          active: true,
        });
      }

      // Split ambiguous "transfer" / "airport" line items between pickup/dropoff
      // based on which deal flags are set. If both flags are set, halve it; if
      // only one is set, attribute it to that side.
      if (transferFeeTotal > 0) {
        const isTrueLocal = (v: any) => String(v ?? '').toLowerCase() === 'true';
        const wantPickup = isTrueLocal(dp.airport_pickup);
        const wantDropoff = isTrueLocal(dp.airport_dropoff);
        if (wantPickup && wantDropoff) {
          pickupFeeTotal  += transferFeeTotal / 2;
          dropoffFeeTotal += transferFeeTotal / 2;
        } else if (wantPickup) {
          pickupFeeTotal += transferFeeTotal;
        } else if (wantDropoff) {
          dropoffFeeTotal += transferFeeTotal;
        } else {
          // No deal flag — drop into pickup as a default. Better than losing it.
          pickupFeeTotal += transferFeeTotal;
        }
      }

      // Create booking
      const hsAmount = invoiceAmount || totalAmount || parseFloat(dp.amount) || 0;

      // Upsert the agency for B2B bookings.
      // Per CLAUDE.md agency rule: only id/name/hubspotCompanyId are stored locally.
      // Commission rate stays in HubSpot and is fetched on-demand by the document layer.
      // Two paths, mirroring the SIS data model (Agency.primaryEntityType):
      //   (a) Deal has a Company  → company-primary agency
      //   (b) Deal has only a sole-trader Agent (Employee-typed contact, no company)
      //       → contact-primary agency. The deal is the functional link between the
      //       Employee and the Student; we use that signal to record the agency.
      // Mirrors registerPartner() in partners.ts.
      let agencyId: number | null = null;
      if (resolvedCompanyId) {
        let agency = await prisma.agency.findUnique({ where: { hubspotCompanyId: resolvedCompanyId } });
        if (!agency) {
          // Dup guard: adopt an existing unlinked (Fidelo-legacy) row of the same
          // name instead of minting a second row for this partner. Prevents the
          // split-twin dups cleaned up in 2026-06 (legacy bookings row + HS shell).
          const legacy = resolvedCompanyName
            ? await prisma.agency.findFirst({ where: { hubspotCompanyId: null, name: { equals: resolvedCompanyName, mode: 'insensitive' } } })
            : null;
          if (legacy) {
            agency = await prisma.agency.update({
              where: { id: legacy.id },
              data: { hubspotCompanyId: resolvedCompanyId, primaryEntityId: resolvedCompanyId, primaryEntityType: 'company' } as any,
            });
            console.log(`[Invoice Created] Dup-guard: adopted legacy agency #${legacy.id} "${legacy.name}" → HS company ${resolvedCompanyId} (no new row)`);
          } else {
            agency = await prisma.agency.create({
              data: {
                name: resolvedCompanyName || `HubSpot Company ${resolvedCompanyId}`,
                hubspotCompanyId: resolvedCompanyId,
                primaryEntityId: resolvedCompanyId,
                primaryEntityType: 'company',
              } as any,
            });
          }
        } else if (resolvedCompanyName && agency.name !== resolvedCompanyName) {
          // Refresh display name if HubSpot has updated it
          await prisma.agency.update({ where: { id: agency.id }, data: { name: resolvedCompanyName } });
        }
        agencyId = agency.id;
      } else if (agentContactId) {
        let agency = await prisma.agency.findFirst({
          where: { primaryEntityId: agentContactId, primaryEntityType: 'contact' } as any,
        });
        if (!agency) {
          // Look up the agent contact for a display name
          let agentName = `HubSpot Contact ${agentContactId}`;
          try {
            const ac = await hsGet(`/crm/v3/objects/contacts/${agentContactId}?properties=firstname,lastname,email`);
            const acp = ac.properties || {};
            const fullName = `${acp.firstname || ''} ${acp.lastname || ''}`.trim();
            agentName = fullName || acp.email || agentName;
          } catch (e: any) {
            console.warn(`[Invoice Created] sole-trader agent name lookup failed for contact ${agentContactId}: ${e.message}`);
          }
          agency = await prisma.agency.create({
            data: {
              name: agentName,
              primaryEntityId: agentContactId,
              primaryEntityType: 'contact',
            } as any,
          });
          console.log(`[Invoice Created] Auto-created sole-trader agency #${agency.id} "${agentName}" for contact ${agentContactId}`);
        }
        agencyId = agency.id;
      }

      // Build Extras from deal properties (airport transfers + exam fee + insurance).
      // HubSpot stores booleans as 'true'/'false' strings.
      const extras: any[] = [];
      const isTrue = (v: any) => String(v ?? '').toLowerCase() === 'true';

      // AY / LifePass auto-bundle — Exam Fee + PEL/Health Insurance are always
      // included with these packs. The frontend hides the checkboxes for these
      // courses, but if a deal arrives without the props set (manual creation,
      // legacy workflow, drift), enrich defensively here so the SIS Booking
      // still gets the right extras. Mirrors the partners.ts enroll() rule.
      const courseTypeRaw = String(dp.course_type || '');
      const isBundledCourse = /^ay_year_/i.test(courseTypeRaw) || /^lifepass\s*/i.test(courseTypeRaw);
      const examFeeOn   = isTrue(dp.exam_fee)  || isBundledCourse;
      const insuranceVal = isBundledCourse
        ? 'PEL;Health'
        : (String(dp.insurance || '').trim() || null);

      // Airport Pickup
      if (isTrue(dp.airport_pickup)) {
        const ts = dp.airport_pickup_time ? new Date(parseInt(dp.airport_pickup_time) || dp.airport_pickup_time) : null;
        extras.push({
          extraType: 'AIRPORT_PICKUP',
          scheduledAt: ts && !isNaN(ts.getTime()) ? ts : null,
          fee: pickupFeeTotal > 0 ? pickupFeeTotal : null,
          active: true,
        });
      }
      // Airport Dropoff
      if (isTrue(dp.airport_dropoff)) {
        const ts = dp.airport_dropoff_time ? new Date(parseInt(dp.airport_dropoff_time) || dp.airport_dropoff_time) : null;
        extras.push({
          extraType: 'AIRPORT_DROPOFF',
          scheduledAt: ts && !isNaN(ts.getTime()) ? ts : null,
          fee: dropoffFeeTotal > 0 ? dropoffFeeTotal : null,
          active: true,
        });
      }
      // Exam Fee — exam_type left null for bundled courses (set later from level test)
      if (examFeeOn) {
        extras.push({
          extraType: 'EXAM_FEE',
          details: isBundledCourse ? null : ((dp.exam_type || '').trim() || null),
          fee: examFeeTotal > 0 ? examFeeTotal : null,
          active: true,
        });
      }
      // Insurance — multi-checkbox stored as semicolon-delimited (e.g. "PEL;Health")
      if (insuranceVal) {
        extras.push({
          extraType: 'INSURANCE',
          details: insuranceVal,
          fee: insuranceFeeTotal > 0 ? insuranceFeeTotal : null,
          active: true,
        });
      }

      const booking = await prisma.booking.create({
        data: {
          studentId: student.id,
          agencyId: agencyId || undefined,
          hubspotDealId: resolvedDealId,
          hubspotInvoiceId: invoiceId || null,
          status: 'PENDING',
          confirmed: false,
          serviceStart: courseStart,
          serviceEnd: courseEnd,
          currency: 'EUR',
          amountTotal: hsAmount,
          amountPaid: 0,
          amountOpen: hsAmount,
          regFee:       regFeeTotal       > 0 ? regFeeTotal       : null,
          placementFee: placementFeeTotal > 0 ? placementFeeTotal : null,
          dataSource: 'HUBSPOT',
          hubspotChallenge: dp.challenge || null, // null if deal doesn't have challenge set
          note: `HubSpot Deal: ${dp.dealname || resolvedDealId}`,
          courses: courses.length > 0 ? { create: courses } : undefined,
          accommodations: accommodations.length > 0 ? { create: accommodations } : undefined,
          extras: extras.length > 0 ? { create: extras } : undefined,
          // No statusHistory entry on initial creation — there's no genuine "from" state.
          // History is appended on subsequent transitions (e.g. PENDING → PARTIAL → COMPLETE).
        } as any,
        include: { student: true, courses: true, accommodations: true, extras: true },
      });

      // Auto-apply the school's Christmas closure(s) to AY-visa bookings: shunt
      // the course end forward + record a type='school' holiday (the new-system
      // equivalent of Fidelo's course split). No-op for non-AY. Wrapped so a
      // shunt failure can never abort booking creation — it's re-runnable.
      try {
        const xmas = await applyChristmasClosures(prisma, booking.id);
        if (xmas.applied) console.log(`[webhook] Christmas shunt: applied ${xmas.applied} closure(s) to booking ${booking.id}`, JSON.stringify(xmas.details));
      } catch (e) {
        console.error(`[webhook] Christmas shunt failed for booking ${booking.id} (booking still created):`, (e as any)?.message);
      }

      const name = `${student.firstName} ${student.lastName}`;
      // Channel is derived from what we actually resolved, not the workflow's `type` hint.
      // B2B covers both company-primary agencies and sole-trader (contact-primary) agencies.
      const resolvedChannel = agencyId ? 'B2B' : 'B2C';
      const agencyDisplayName = await (async () => {
        if (!agencyId) return null;
        if (resolvedCompanyName) return resolvedCompanyName;
        const a = await prisma.agency.findUnique({ where: { id: agencyId }, select: { name: true } });
        return a?.name || null;
      })();
      const channel = agencyDisplayName ? `${resolvedChannel} via ${agencyDisplayName}` : resolvedChannel;
      console.log(`[Invoice Created] ${name} (${channel}): booking #${booking.id} — €${hsAmount} (${courses.length} courses, ${accommodations.length} accomm, ${extras.length} extras)`);

      res.json({
        status: 'ok',
        channel: resolvedChannel,
        student: name,
        studentId: student.id,
        bookingId: booking.id,
        agencyId: agencyId || null,
        agencyName: agencyDisplayName,
        amountTotal: hsAmount,
        courses: courses.length,
        accommodations: accommodations.length,
        extras: extras.length,
      });

      // ────────────────────────────────────────────────────────────
      // Fire-and-forget: create the Xero invoice directly (B2B only).
      //
      // DataSync's HubSpot→Xero sync of B2B invoices has proven unreliable —
      // sometimes syncs at gross (stripping the quote-level commission discount),
      // sometimes fails outright, with hour-scale unpredictable latency. Rather
      // than poll for / patch DataSync's eventual result, we create the Xero
      // invoice ourselves at webhook time, with the partner commission as a
      // negative-amount line item (Xero accepts negative unitAmount on invoice
      // lines, confirmed empirically).
      //
      // Tradeoff: if DataSync ever does manage to also sync the same invoice,
      // we end up with two parallel Xero records sharing the same number.
      // Accepted per design discussion; the bookkeeper sees our invoice (which
      // is the correct one with commission applied).
      //
      // Runs after res.json so HubSpot gets a fast 200; errors are logged but
      // never affect the webhook response. Idempotent — if our Xero invoice
      // already exists (re-fire), the helper detects it and only adds the
      // commission line if missing.
      // ────────────────────────────────────────────────────────────
      if (resolvedChannel === 'B2B' && invoiceId) {
        (async () => {
          try {
            console.log(`[Xero Invoice] starting for hubspotInvoiceId=${invoiceId}, dealId=${resolvedDealId}, agency=${agencyDisplayName || '(none)'}`);
            const result = await createXeroInvoiceWithRetry({
              hubspotInvoiceId: invoiceId,
              hubspotDealId: resolvedDealId,
            });
            console.log(`[Xero Invoice] ${result.status}:`, JSON.stringify(result));
          } catch (e: any) {
            console.error(`[Xero Invoice] FAILED for invoice ${invoiceId}: ${e.message}`);
            if (e?.response?.body) {
              console.error(`[Xero Invoice] response body:`, JSON.stringify(e.response.body).slice(0, 1000));
            }
          }
        })();
      }

      // ────────────────────────────────────────────────────────────
      // Fire-and-forget: for LifePass deals, create a SECOND HubSpot
      // invoice carrying the full subscription value (25 × €297 = €7,425),
      // associated to the same deal as the salesperson's €997 onboarding
      // invoice. See createLifePassSubscriptionInvoice() for details.
      // Also fired from the dedup path so a re-conversion of an existing
      // booking still gets its sibling invoice created.
      // ────────────────────────────────────────────────────────────
      if (/^lifepass\s*/i.test(courseTypeRaw)) {
        createLifePassSubscriptionInvoice(resolvedDealId, `booking #${booking.id}`, prisma).catch(() => {});
      }

      // Capture the quote/invoice share links for the receipt icons in the UI.
      captureReceiptLinks(prisma, booking.id, invoiceId || null, resolvedDealId).catch(() => {});

      // First-time == every-time: run the same reconciler the re-fire path uses, so any
      // fee-bearing line item the create path's deal-property build missed (e.g. an airport
      // transfer added as a line item without the matching deal flag) is still captured, and
      // the total/fees are line-item authoritative from the outset. Idempotent + fire-and-forget.
      resyncBookingLogistics(prisma, booking.id, resolvedDealId, invoiceId || null)
        .then(ch => { if (ch.length) console.log(`[Invoice Created] (create-path) post-create reconcile #${booking.id}: ${ch.join('; ')}`); })
        .catch(e => console.error(`[Invoice Created] (create-path) reconcile failed for booking ${booking.id}: ${e.message}`));

    } catch (e: any) {
      console.error('[Invoice Created] Error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // Mirror the accommodation card-on-file guarantee HubSpot → SIS
  // (students.card_on_file). Called from /invoice-paid after a payment posts —
  // NO separate webhook (Neil, 2026-08-20). The native "PaymentSuccess →
  // CardOnFile=Yes" HubSpot workflow (Card + Succeeded) sets the contact
  // property, but it RACES the payment webhook, so read after a short delay.
  // Fire-and-forget: never blocks or fails the payment update. Only students
  // with an ACTIVE accommodation booking are mirrored (relevant only for accom).
  // The €1 CardOnFile-link cohort is handled separately by the onboarding poll
  // (that standalone payment never changes an invoice amount, so it doesn't hit
  // /invoice-paid).
  function scheduleCardGuaranteeMirror(studentId: number, contactId: string, delayMs = 30000) {
    const t = setTimeout(async () => {
      try {
        const hasAccom = await prisma.bookingAccommodation.count({ where: { booking: { studentId }, active: true } });
        if (!hasAccom) return;
        const c = await hsGet(`/crm/v3/objects/contacts/${contactId}?properties=accommodation_card_guarantee`);
        const yes = (c?.properties?.accommodation_card_guarantee || '') === 'Yes';
        await prisma.student.update({ where: { id: studentId }, data: yes ? { cardOnFile: true, cardOnFileAt: new Date() } : { cardOnFile: false } });
        console.log(`[card-guarantee mirror] student ${studentId} cardOnFile=${yes} (via invoice-paid +${delayMs / 1000}s)`);
      } catch (e: any) { console.error('[card-guarantee mirror] failed:', e?.message || e); }
    }, delayMs);
    (t as any).unref?.();
  }

  // Direct mirror for the €1 CardOnFile nominal payment — the ONE card payment
  // that never hits /invoice-paid (payment-link payments don't generate an
  // invoice, and forcing the €1 onto the invoice would sit €1 over the billed
  // amount in Xero — messy). Called by a NARROW branch at the end of the HubSpot
  // CardOnFile workflow, filtered to the €1 cardStorage checkout ONLY, so it
  // never duplicates the €250/invoice card payments (those flow through
  // /invoice-paid → scheduleCardGuaranteeMirror). Accepts contactId/email, OR a
  // paymentId (resolves the associated contact from HubSpot). Never throws.
  router.post('/card-guarantee', async (req, res) => {
    try {
      const b = req.body || {};
      const props = b.properties || {};
      let contactId = b.contactId || b.objectId || b.vid || b['canonical-vid'] || props['hs_object_id']?.value;
      const email = b.email || props.email?.value || props.email || null;
      const paymentId = b.paymentId || b.hs_payment_id || (b.objectType === 'commerce_payment' ? b.objectId : null);
      // If only a paymentId came through (payment-enrolled workflow), resolve its
      // associated contact from HubSpot.
      if (!contactId && !email && paymentId) {
        try {
          const assoc = await hsGet(`/crm/v3/objects/commerce_payment/${paymentId}/associations/contacts`);
          contactId = assoc.results?.[0]?.id || assoc.results?.[0]?.toObjectId;
        } catch { /* fall through to no-match */ }
      }
      const rawVal = b.value ?? props.accommodation_card_guarantee?.value ?? props.accommodation_card_guarantee;
      const yes = rawVal === undefined ? true : (rawVal === 'Yes' || rawVal === true || rawVal === 'true');
      let student: any = null;
      if (contactId) student = await prisma.student.findFirst({ where: { hubspotContactId: String(contactId) }, select: { id: true } });
      if (!student && email) student = await prisma.student.findFirst({ where: { email: { equals: String(email), mode: 'insensitive' } }, select: { id: true } });
      if (!student) return res.status(200).json({ ok: true, matched: false, note: 'no SIS student for that contact/email/payment' });
      await prisma.student.update({ where: { id: student.id }, data: yes ? { cardOnFile: true, cardOnFileAt: new Date() } : { cardOnFile: false } });
      console.log(`[card-guarantee €1] student ${student.id} cardOnFile=${yes} (contact ${contactId || '-'}, payment ${paymentId || '-'})`);
      res.json({ ok: true, matched: true, studentId: student.id, cardOnFile: yes });
    } catch (e: any) {
      console.error('[card-guarantee] error:', e?.message || e);
      res.status(200).json({ ok: false, error: String(e?.message || e) });
    }
  });

  // HubSpot invoice payment status webhook
  // Triggered by HubSpot workflow when invoice status changes (paid, partially_paid)
  router.post('/invoice-paid', async (req, res) => {
    try {
      const { invoiceId, dealId } = req.body;

      if (!invoiceId && !dealId) {
        return res.status(400).json({ error: 'invoiceId or dealId required' });
      }

      // Seat Clearance: if this paid invoice backs clearance seat reservations,
      // flip them PENDING → RESERVED and return — it's not a booking invoice.
      if (invoiceId) {
        try {
          const n = await clearanceScripts(prisma).markPaidByInvoice(String(invoiceId));
          if (n > 0) {
            console.log(`[invoice-paid] clearance invoice ${invoiceId} → confirmed ${n} seat reservation(s)`);
            return res.json({ ok: true, clearanceConfirmed: n });
          }
        } catch (e: any) { console.warn('[invoice-paid] clearance check failed:', e?.message || e); }
      }

      // Find the deal ID if we only got invoiceId
      let resolvedDealId = dealId;
      if (!resolvedDealId && invoiceId) {
        const assoc = await hsGet(`/crm/v3/objects/invoices/${invoiceId}/associations/deals`);
        resolvedDealId = assoc.results?.[0]?.id;
      }

      if (!resolvedDealId) {
        return res.status(404).json({ error: 'No deal found for this invoice' });
      }

      // Get invoice details
      const invoiceAssoc = await hsGet(`/crm/v3/objects/deals/${resolvedDealId}/associations/invoices`);
      const invoiceIds = (invoiceAssoc.results || []).map((r: any) => r.id);

      let totalBilled = 0;
      let totalPaid = 0;

      for (const invId of invoiceIds) {
        const inv = await hsGet(`/crm/v3/objects/invoices/${invId}?properties=hs_amount_billed,hs_amount_paid,hs_invoice_status,hs_number`);
        const props = inv.properties || {};
        const status = (props.hs_invoice_status || '').toLowerCase();
        // Skip VOIDED/DELETED invoices — they're cancelled, so their billed
        // amount is not owed. Summing them inflated totalBilled and left a
        // phantom balance that never cleared (Fiorella INV-1032 €2591, 2026-06).
        if (status === 'voided' || status === 'deleted') continue;
        // Skip LifePass subscription masters (INV-####-Sub, €297×25) — that's
        // the instalment ledger, tracked separately, not the booking balance.
        if (/-Sub$/i.test(props.hs_number || '')) continue;
        totalBilled += parseFloat(props.hs_amount_billed) || 0;
        totalPaid += parseFloat(props.hs_amount_paid) || 0;
      }

      const isFullyPaid = totalPaid >= totalBilled && totalBilled > 0;

      // Find the SIS booking for this deal.
      // Dedup via Booking.hubspotDealId (unique FK). NOTE: do NOT add
      // `dataSource: HUBSPOT` here — that filter was excluding the ~70
      // Fidelo-origin bookings that later got a HubSpot deal id attached, so
      // every payment event silently 404'd for them and SIS amountPaid drifted
      // out of sync with HubSpot/Xero (Flávia INV-1136 was the smoking gun).
      // `hubspotDealId` is already unique per booking, so this lookup is exact.
      const booking = await prisma.booking.findFirst({
        where: { hubspotDealId: resolvedDealId } as any,
        include: { student: true },
      });

      if (!booking) {
        return res.status(404).json({ error: 'No SIS booking found for deal ' + resolvedDealId });
      }

      // Card-on-file mirror: a payment just posted, so (after the race delay) pull
      // the contact's accommodation_card_guarantee across to students.card_on_file.
      // Fire-and-forget — does not affect the payment update below.
      if (booking.student?.hubspotContactId) {
        scheduleCardGuaranteeMirror(booking.student.id, booking.student.hubspotContactId);
      }

      // Guard: never let totalPaid=0 from HubSpot clobber an existing real
      // SIS deposit. Fidelo-origin bookings carry their original Payment rows
      // and amountPaid even when their HubSpot deal has no invoice yet (or an
      // invoice with no payments), in which case HubSpot returns hs_amount_paid=0.
      // Writing 0 over those = silently destroying real money on the ledger
      // (caused the Flávia + 57-booking incident, 28 May 2026). Skip the
      // update entirely in that case — log loudly. Real reversals still flow
      // through (Xero deletes a payment → HubSpot's hs_amount_paid drops but
      // typically stays > 0; for a full reversal handle manually).
      const existingPaid = Number(booking.amountPaid || 0);
      if (totalPaid === 0 && existingPaid > 0) {
        console.warn(`[Payment Webhook] SKIP bk${booking.id} (${booking.student?.firstName} ${booking.student?.lastName}): HubSpot reports €0 paid but SIS already has €${existingPaid.toFixed(2)} (Fidelo deposit?). Refusing to overwrite.`);
        return res.json({ status: 'skipped', reason: 'hubspot-zero-vs-sis-paid', bookingId: booking.id, sisAmountPaid: existingPaid });
      }

      // Update booking payment status
      const updateData: any = {
        amountPaid: totalPaid,
        // No Math.max clamp — let an overpayment store as a NEGATIVE balance so
        // duplicate/over-assigned payments surface instead of hiding at 0. The
        // LoA gate keys on balance > 0.01, so a negative never blocks.
        amountOpen: totalBilled - totalPaid,
      };
      // Keep Total aligned with the gross actually billed (incl. any card
      // surcharge, which only appears in hs_amount_billed at payment). Without
      // this, a base-created/card-paid-later booking keeps amountTotal at base
      // while amountPaid jumps to gross → phantom "overpaid" delta in the
      // Total/Paid columns. Guard the spurious-0 case (all invoices voided) so
      // we never wipe a real stored total to zero.
      if (totalBilled > 0) updateData.amountTotal = totalBilled;

      // Status reconciliation — handles both forward and reverse transitions.
      // Reverse happens when a payment is deleted/reduced in Xero, which propagates
      // back to HubSpot, which should (if the workflow is wired correctly) re-fire
      // this webhook with the lower totalPaid.
      let targetStatus: string | null = null;
      if (isFullyPaid) {
        targetStatus = 'CONFIRMED';
      } else if (totalPaid > 0) {
        targetStatus = 'PARTIAL';
      } else {
        // totalPaid === 0 → payment was removed, roll back to PENDING
        targetStatus = 'PENDING';
      }

      if (targetStatus !== booking.status) {
        updateData.status = targetStatus;
        updateData.confirmed = targetStatus === 'CONFIRMED';
        if (targetStatus === 'CONFIRMED') updateData.confirmedAt = new Date();
        else if (booking.status === 'CONFIRMED') updateData.confirmedAt = null; // rolled back from CONFIRMED

        await prisma.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            fromStatus: booking.status || 'PENDING',
            toStatus: targetStatus,
            changedBy: 'payment-webhook',
          } as any,
        });
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: updateData,
      });

      // ── Sync individual payment records from HubSpot ──
      // Fetches every commerce_payment associated with the deal's invoice(s),
      // upserts them into the SIS Payment table keyed by hubspotPaymentId, and
      // removes any stale SIS rows whose HubSpot source has been deleted.
      // Manual payments (dataSource=MANUAL) are never touched.
      try {
        const hsPaymentIdsFound = new Set<string>();
        for (const invId of invoiceIds) {
          const pAssoc = await hsGet(`/crm/v4/objects/invoices/${invId}/associations/commerce_payments`);
          const payIds = (pAssoc.results || []).map((r: any) => String(r.toObjectId));
          if (payIds.length === 0) continue;

          const batch = await hsPost('/crm/v3/objects/commerce_payments/batch/read', {
            inputs: payIds.map((id: string) => ({ id })),
            properties: [
              'hs_initial_amount', 'hs_initiated_date', 'hs_payment_method',
              'hs_payment_method_type', 'hs_reference_number', 'hs_internal_comment',
              'hs_payment_type', 'hs_latest_status', 'hs_currency_code',
            ],
          });

          for (const pay of (batch.results || [])) {
            const p = pay.properties || {};
            const hsId = String(pay.id);
            hsPaymentIdsFound.add(hsId);
            const amount = parseFloat(p.hs_initial_amount || '0') || 0;
            if (amount <= 0) continue;

            const paymentDate = p.hs_initiated_date
              ? new Date(p.hs_initiated_date)
              : new Date();
            // Method: prefer HubSpot's hs_payment_method_type — the processor-
            // agnostic rail classification. Card payments (credit OR debit) →
            // "Card"; ACH/SEPA/BACS/bank rails → "Bank Transfer". Xero-sourced
            // payments flatten method_type to null → generic "Bank" fallback,
            // later upgraded via the hub /fins/tm/ reconciliation module.
            const mt = String(p.hs_payment_method_type || '').toLowerCase();
            const method = /card/.test(mt) ? 'Card'
              : /(ach|sepa|bacs|bank)/.test(mt) ? 'Bank Transfer'
              : 'Bank';
            // hs_payment_type is a HubSpot billing-cadence enum
            // (one_time_or_initial, recurring…), NOT a SIS ledger Type — normalise
            // every inbound payment to "Standard"; never leak the raw enum to the UI.
            const type = 'Standard';

            await prisma.payment.upsert({
              where: { hubspotPaymentId: hsId },
              // Re-sync refreshes only the volatile fields — never clobber method/
              // type, which a human or the escrow-retag job may have refined.
              update: {
                amount,
                paymentDate,
                transactionId: p.hs_reference_number || null,
                comment: p.hs_internal_comment || null,
              },
              create: {
                bookingId: booking.id,
                hubspotPaymentId: hsId,
                amount,
                paymentDate,
                method,
                transactionId: p.hs_reference_number || null,
                comment: p.hs_internal_comment || null,
                type,
                dataSource: 'HUBSPOT',
              } as any,
            });
          }
        }

        // Clean up any HubSpot-sourced payments on this booking that are no
        // longer present in HubSpot (i.e. deleted in Xero and propagated).
        // Never touches MANUAL or FIDELO payments.
        const existingHsPayments = await prisma.payment.findMany({
          where: { bookingId: booking.id, dataSource: 'HUBSPOT' as any, hubspotPaymentId: { not: null } },
          select: { id: true, hubspotPaymentId: true },
        });
        const toDelete = existingHsPayments
          .filter(p => p.hubspotPaymentId && !hsPaymentIdsFound.has(p.hubspotPaymentId))
          .map(p => p.id);
        if (toDelete.length > 0) {
          await prisma.payment.deleteMany({ where: { id: { in: toDelete } } });
          console.log(`[Payment Webhook] Pruned ${toDelete.length} stale HubSpot payment row(s) on booking ${booking.id}`);
        }
      } catch (e: any) {
        console.error(`[Payment Webhook] Payment row sync failed for booking ${booking.id}:`, e.message);
        // Non-fatal — the booking totals were already updated above
      }

      // Booking.paymentMethod recon (per Neil 2026-05-22):
      // Booking.paymentMethod should reflect how the booking was actually
      // paid. Most recent Payment row's method wins — when the
      // /fins/tm/ TransferMate module (or Stripe / Revolut) lands and
      // upgrades Payment.method from the current "Bank" default to the real
      // processor, the Booking automatically inherits that latest value.
      // Today this means most bookings end up as "Bank" which still beats
      // the blank "—" they had before.
      try {
        const latest = await prisma.payment.findFirst({
          where: { bookingId: booking.id, method: { not: null } },
          orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }],
          select: { method: true },
        });
        if (latest?.method && latest.method !== booking.paymentMethod) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { paymentMethod: latest.method },
          });
        }
      } catch (e: any) {
        console.warn(`[Payment Webhook] paymentMethod recon failed for booking ${booking.id}:`, e?.message || e);
      }

      const name = `${booking.student?.firstName} ${booking.student?.lastName}`;
      console.log(`[Payment Webhook] ${name}: €${totalPaid} of €${totalBilled} — ${isFullyPaid ? 'FULLY PAID' : 'PARTIAL'}`);

      // Move the HubSpot deal to its pipeline's WON stage on the FIRST payment —
      // ANY amount, deposit or partial (Neil 2026-08-21): a paid deposit means the
      // sale is committed. Every later payment re-asserts WON idempotently (the
      // dealstage check below no-ops if already there), so it self-heals across the
      // whole payment timeline. FORWARD-ONLY: a subsequent €0 rollback never un-WONs
      // (the zero-paid guard above already skips this block). PIPELINE-AWARE: resolve
      // the won stage from the deal's OWN pipeline and write only `dealstage` —
      // never hardcode 'closedwon' (that belongs to Direct/B2C and would drag a
      // B2B deal into the wrong pipeline). Mirrors escrow.js markWon.
      if (totalPaid > 0) {
        const deal = await hsGet(`/crm/v3/objects/deals/${resolvedDealId}?properties=pipeline,dealstage`);
        const pipeline = deal?.properties?.pipeline;
        const wonStage = pipeline ? await resolveWonStage(pipeline) : null;
        if (!wonStage) {
          console.warn(`[Payment Webhook] No won stage resolved for deal ${resolvedDealId} (pipeline ${pipeline}) — leaving stage unchanged`);
        } else if (deal.properties.dealstage === wonStage) {
          console.log(`[Payment Webhook] Deal ${resolvedDealId} already WON (${wonStage}) — no-op`);
        } else {
          const result = await hsPatch(`/crm/v3/objects/deals/${resolvedDealId}`, {
            properties: { dealstage: wonStage },
          });
          console.log(`[Payment Webhook] Deal ${resolvedDealId} → WON (pipeline ${pipeline}, stage ${wonStage}, ${result.status})`);
        }
      }

      // Welcome Aboard onboarding email — same "first payment" moment as the WON
      // move. Fire-once per student, skips groups + placeholder emails; idempotent
      // and non-fatal (see sendWelcomeAboardIfNew). Awaited but self-contained.
      if (totalPaid > 0) {
        await sendWelcomeAboardIfNew(prisma, booking);
      }

      // Auto-deduct the agency credit STORE when a HubSpot credit memo has been
      // applied to a booking invoice. The memo object is API-walled, but the
      // invoice's `credit_memos` association is readable and the credit amount is
      // derivable (paid − real payments). Idempotent, non-fatal. Closes the loop:
      // application in HubSpot → SIS store draws down automatically.
      try {
        const rec = await reconcileBookingCredit(prisma, booking.id);
        if (rec.posted) console.log(`[Payment Webhook] credit-store reconcile bk${booking.id}: detected €${rec.detected}, was drawn €${rec.drawn}, posted delta €${rec.delta}`);
      } catch (e: any) {
        console.warn(`[Payment Webhook] credit-store reconcile failed for booking ${booking.id}:`, e?.message || e);
      }

      res.json({
        status: 'ok',
        student: name,
        amountPaid: totalPaid,
        amountBilled: totalBilled,
        fullyPaid: isFullyPaid,
        dealMovedToWon: totalPaid > 0,
      });

      // Part B — re-sync the Xero invoice(s) to the now-final hs_amount_billed.
      // The buyer's card/SEPA surcharge ("add fees") is applied at checkout, so
      // for an invoice created at base price and paid by card LATER it only
      // appears in hs_amount_billed at payment — and invoice-created does NOT
      // re-fire then, so the Xero invoice would stay short by the surcharge.
      // Mirror DataSync's "HubSpot total changed → refresh Xero" for OUR cohort.
      // Fire-and-forget (after the response) so the builder's no-contact retry
      // never blocks the webhook ack. The builder self-gates: it skips invoices
      // with no order-level discount (DataSync owns those) and refuses to touch
      // a Xero invoice that already has a payment applied. We additionally skip
      // voided/deleted and LifePass -Sub masters, mirroring the sum loop above.
      (async () => {
        for (const invId of invoiceIds) {
          try {
            const inv = await hsGet(`/crm/v3/objects/invoices/${invId}?properties=hs_invoice_status,hs_number`);
            const st = (inv.properties?.hs_invoice_status || '').toLowerCase();
            if (st === 'voided' || st === 'deleted') continue;
            if (/-Sub$/i.test(inv.properties?.hs_number || '')) continue;
            const r = await createXeroInvoiceWithRetry(
              { hubspotInvoiceId: invId, hubspotDealId: resolvedDealId },
              ' (invoice-paid resync)',
            );
            console.log(`[Xero Invoice] (invoice-paid resync) ${invId} (${inv.properties?.hs_number}): ${r?.status}`);
          } catch (e: any) {
            console.error(`[Xero Invoice] (invoice-paid resync) FAILED ${invId}: ${e.message}`);
          }
        }
      })();
    } catch (e: any) {
      console.error('[Payment Webhook] Error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // Megatron Financial dashboard — Xero↔HubSpot reconciliation for B2B invoices.
  //
  // Source of truth = Xero invoices. We pull the small set of relevant Xero
  // invoices (Type=ACCREC, status AUTHORISED or PAID, issued since 2026-01-01)
  // and check each one against HubSpot. A "mismatch" is anything where Xero's
  // amountPaid exceeds HubSpot's recorded hs_amount_paid — i.e. Xero received
  // a payment that hasn't been mirrored to HubSpot yet.
  //
  // Why Xero-first: Xero is the authoritative source of "what was actually
  // paid" (reconciled from the bank feed) and is the small, well-bounded set
  // (~10–30 active invoices). Iterating from HubSpot or SIS Bookings dragged
  // in test data + historical noise.
  //
  // Query params:
  //   apply=true     — for each mismatch, POST a Payment to HubSpot for the
  //                    delta. HubSpot then auto-updates the invoice's payment
  //                    status; the existing /invoice-paid handler picks up
  //                    the change and progresses the deal.
  //                    Without apply, the endpoint is read-only (default).
  //
  // ── TransferMate escrow shadow-payment receiver ───────────────────────
  // POST /sis/api/webhooks/transfermate-escrow
  //
  // Called server-to-server by the hub when TransferMate fires its webhook
  // with `escrow=1`. Escrow money NEVER touches Xero, so the standard
  // /invoice-paid path doesn't fire — this handler records the SIS-side
  // shadow payment and flips the booking to ESCROW so all the existing
  // downstream filters (matching, transport, class roster, host-payments,
  // LoA gate, partner statements — see TransferMate/escrow/spec-v1.md)
  // hide the student until the visa decision settles.
  //
  // Mirrors the Fidelo-importer shape exactly (import-fidelo-payments-api.ts
  // line 216-224): type='Escrow', method='TransferMate Escrow', dataSource
  // 'TM_API'. The booking-amountPaid rollup at bookings.ts:495-512 already
  // excludes Escrow-tagged rows, so we deliberately do NOT touch amountPaid.
  //
  // Auth: shared secret via X-TM-Internal-Secret. The hub holds the same
  // value in TM_INTERNAL_SECRET on both sides.
  //
  // Idempotency: receiptNumber 'TM-<tmPaymentId>' is unique per booking
  // (payments_receipt_booking_unique). Retries return status='exists'.
  //
  // Out of scope here (hub-orchestrated): moving the HubSpot deal to
  // closedwon + setting the escrow flag. That's done by the hub before it
  // calls us — we only own the SIS-side data.
  router.post('/transfermate-escrow', async (req, res) => {
    if (req.headers['x-tm-internal-secret'] !== process.env.TM_INTERNAL_SECRET) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    try {
      const { dealId, amount, tmPaymentId, reference, paymentDate, payerName, currency } = req.body || {};
      if (!dealId || !tmPaymentId || amount == null) {
        return res.status(400).json({ error: 'dealId, tmPaymentId, amount required' });
      }

      // Find the SIS booking via the unique hubspotDealId. Same join key
      // /invoice-paid uses (no dataSource filter — that bug is what caused
      // the Flávia/57-booking incident, see feedback_webhook_zero_guard.md).
      const booking = await prisma.booking.findFirst({
        where: { hubspotDealId: String(dealId) } as any,
        select: { id: true, status: true, student: { select: { firstName: true, lastName: true } } },
      });
      if (!booking) {
        console.warn(`[TM Escrow] no SIS booking for deal ${dealId}`);
        return res.status(404).json({ error: 'No SIS booking for deal ' + dealId });
      }

      // Idempotency check — retries return 200 + status='exists'
      const receiptNumber = `TM-${tmPaymentId}`;
      const existing = await prisma.payment.findFirst({
        where: { bookingId: booking.id, receiptNumber } as any,
        select: { id: true },
      });
      if (existing) {
        return res.json({ status: 'exists', paymentId: existing.id, bookingId: booking.id });
      }

      // Shadow escrow payment — type='Escrow' + method='TransferMate Escrow'
      // keeps it out of the amountPaid rollup AND the partner/matching/LoA
      // gates. dataSource='TM_API' distinguishes from Fidelo-imported escrow
      // rows for audit.
      const created = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: Number(amount),
          method: 'TransferMate Escrow',
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          type: 'Escrow',
          paidBy: payerName || null,
          transactionId: reference || String(tmPaymentId),
          receiptNumber,
          dataSource: 'TM_API' as any,
        } as any,
      });

      // Flip booking to ESCROW — but never DOWNGRADE a CONFIRMED booking.
      // CONFIRMED means real settled money has already arrived; if a TM-side
      // late notification fires after that, ignore the status flip.
      if (booking.status !== 'ESCROW' && booking.status !== 'CONFIRMED') {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'ESCROW' as any, confirmed: false } as any,
        });
        await prisma.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            fromStatus: booking.status || 'PENDING',
            toStatus: 'ESCROW',
            changedBy: 'tm-escrow-webhook',
          } as any,
        });
      }

      const studentLabel = booking.student ? `${booking.student.firstName} ${booking.student.lastName}` : '(no student)';
      console.log(`[TM Escrow] bk${booking.id} ${studentLabel} — €${amount} shadow payment ${receiptNumber} recorded (status now: ${booking.status === 'CONFIRMED' ? 'CONFIRMED-kept' : 'ESCROW'})`);
      return res.json({ status: 'created', paymentId: created.id, bookingId: booking.id, receiptNumber });
    } catch (err: any) {
      console.error('[TM Escrow] error:', err?.message, err?.stack?.split('\n').slice(0, 3).join('\n'));
      return res.status(500).json({ error: err?.message || 'internal error' });
    }
  });


  // Triggered from https://hub.ulearnschool.com/fins/xero/payment-sync.html
  // via /hubapp/financial/xero-payment-sync (which proxies here).
  router.get('/xero-payment-sync', async (req, res) => {
    const apply = String(req.query.apply || '').toLowerCase() === 'true';
    // Optional: restrict the apply action to a single invoice number. Used by the
    // per-row "Apply" buttons in the dashboard so a click applies just that row.
    const onlyNumber = String(req.query.only || '').trim() || null;
    try {
      const { xero, tenantId } = await getAuthedXero();

      // 1. Pull relevant Xero invoices.
      //    Filter: ACCREC (customer invoices, not bills), issued since 2026-01-01,
      //    status AUTHORISED (incl. partially paid) OR PAID. Excludes DRAFT,
      //    SUBMITTED, VOIDED, DELETED.
      const xeroResp = await xero.accountingApi.getInvoices(
        tenantId,
        undefined,                                          // ifModifiedSince
        'Type=="ACCREC" AND Date>=DateTime(2026,01,01)',    // where
        'Date DESC',                                        // order
        undefined,                                          // iDs
        undefined,                                          // invoiceNumbers
        undefined,                                          // contactIDs
        ['AUTHORISED', 'PAID'],                             // statuses
      );
      const xeroInvoices = xeroResp.body.invoices || [];

      if (xeroInvoices.length === 0) {
        return res.json({ applied: apply, rows: [], summary: { checked: 0, mismatches: 0, applied: 0, errors: 0 } });
      }

      // 2. Batch-lookup matching HubSpot invoices by number.
      const numbers = xeroInvoices
        .map((x: any) => x.invoiceNumber)
        .filter((n: any): n is string => !!n && n !== 'INV-DRAFT');

      const hsByNumber = new Map<string, any>();
      if (numbers.length > 0) {
        const hsResp = await hsPost('/crm/v3/objects/invoices/search', {
          filterGroups: [{
            filters: [{ propertyName: 'hs_number', operator: 'IN', values: numbers }],
          }],
          properties: [
            'hs_number', 'hs_amount_billed', 'hs_amount_paid',
            'hs_invoice_status', 'hs_payment_status', 'hs_currency_code',
          ],
          limit: 100,
        });
        for (const inv of hsResp?.results || []) {
          const num = inv.properties?.hs_number;
          if (num) hsByNumber.set(num, inv);
        }
      }

      // 3. Best-effort enrichment from SIS Booking table — links student name +
      //    agency for the dashboard display. Not used for any logic.
      const hsIds = Array.from(hsByNumber.values()).map((h: any) => h.id).filter(Boolean);
      const bookingByHsId = new Map<string, any>();
      if (hsIds.length > 0) {
        const bookings = await prisma.booking.findMany({
          where: { hubspotInvoiceId: { in: hsIds } } as any,
          include: { agency: true, student: true },
        });
        for (const b of bookings as any[]) {
          if (b.hubspotInvoiceId) bookingByHsId.set(b.hubspotInvoiceId, b);
        }
      }

      // 4. Build rows + optionally apply Payment to HubSpot.
      const rows: any[] = [];
      let appliedCount = 0;
      let errorCount = 0;
      for (const x of xeroInvoices as any[]) {
        const num = x.invoiceNumber || '';
        const h = num ? hsByNumber.get(num) : null;
        const hp = h?.properties || {};

        const xeroTotal    = parseFloat(String(x.total ?? '0'));
        const xeroPaid     = parseFloat(String(x.amountPaid ?? '0'));
        const hubspotTotal = h ? parseFloat(hp.hs_amount_billed || '0') : null;
        const hubspotPaid  = h ? parseFloat(hp.hs_amount_paid  || '0') : null;
        const currency     = (hp.hs_currency_code || x.currencyCode || 'EUR') as string;
        const delta        = xeroPaid - (hubspotPaid ?? 0);
        const needsSync    = !!h && delta > 0.01;

        const booking = h ? bookingByHsId.get(h.id) : null;
        const studentName = booking
          ? `${booking.student?.firstName || ''} ${booking.student?.lastName || ''}`.trim()
          : null;
        const agencyName = booking?.agency?.name || x.contact?.name || null;

        const row: any = {
          invoiceNumber: num,
          xeroInvoiceID: x.invoiceID,
          bookingId:     booking?.id || null,
          studentName,
          agencyName,
          hubspotStatus: h ? (hp.hs_payment_status || hp.hs_invoice_status || null) : null,
          hubspotTotal,
          hubspotPaid,
          xeroStatus:    x.status,
          xeroTotal,
          xeroPaid,
          delta:         Math.round(delta * 100) / 100,
          needsSync,
          note: !h
            ? 'No matching HubSpot invoice'
            : (needsSync ? 'Xero received payment not in HubSpot' : ''),
          applyResult:   null,
        };

        if (apply && needsSync && h?.id && (!onlyNumber || num === onlyNumber)) {
          // Idempotency guard: skip if we already applied this invoice recently.
          // Without this, a second click within the HubSpot-propagation window
          // would create a duplicate Payment.
          const lastApply = recentApplies.get(num);
          if (lastApply && Date.now() - lastApply < RECENT_APPLY_WINDOW_MS) {
            const ageSec = Math.round((Date.now() - lastApply) / 1000);
            row.applyResult = {
              status: 'skipped',
              error: `Already applied ${ageSec}s ago — wait for HubSpot to propagate (cache expires in ${Math.round((RECENT_APPLY_WINDOW_MS - (Date.now() - lastApply)) / 1000)}s)`,
            };
            console.log(`[Xero HubSync] Skip ${num} (recently applied ${ageSec}s ago)`);
          } else {
            try {
              const payAmount = Math.round(delta * 100) / 100;
              const created = await hsPost('/crm/v3/objects/payments', {
                properties: {
                  hs_amount:         String(payAmount),
                  hs_currency_code:  currency,
                  hs_payment_date:   new Date().toISOString().split('T')[0],
                },
              });
              const paymentId = (created as any)?.id;
              if (paymentId) {
                await hsPut(`/crm/v4/objects/payments/${paymentId}/associations/default/invoices/${h.id}`, {});
                recentApplies.set(num, Date.now());  // mark as applied for idempotency
                row.applyResult = { status: 'ok', paymentId, amount: payAmount };
                appliedCount++;
                console.log(`[Xero HubSync] Applied €${payAmount} to HubSpot ${num} (paymentId=${paymentId})`);
              } else {
                row.applyResult = { status: 'error', error: 'HubSpot create returned no id', body: created };
                errorCount++;
              }
            } catch (e: any) {
              row.applyResult = { status: 'error', error: e?.message || 'unknown', body: e?.response?.data || null };
              errorCount++;
              console.error(`[Xero HubSync] Apply failed for ${num}: ${e?.message}`);
            }
          }
        }

        rows.push(row);
      }

      const summary = {
        checked: rows.length,
        mismatches: rows.filter(r => r.needsSync).length,
        applied: appliedCount,
        errors: errorCount,
      };
      console.log(`[Xero HubSync] Done (apply=${apply}): ${JSON.stringify(summary)}`);
      res.json({ applied: apply, summary, rows });
    } catch (e: any) {
      console.error('[Xero HubSync] Error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}
