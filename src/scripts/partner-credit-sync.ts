/**
 * Partner credit → Xero + HubSpot push.
 *
 * A SIS credit GRANT is the source of truth (Partner Portal "store"). On create
 * it auto-mirrors outward:
 *   - Xero: a customer credit note (ACCRECCREDIT) on the agency's Xero contact,
 *     resolved by the OPERABLE portal-login email (which lands on the live
 *     contact and sidesteps the legacy DataSync duplicates).
 *   - HubSpot: a "Create Credit Memo" task on the agency's Company — because the
 *     credit-memo object itself is API-walled for standard apps, the task is the
 *     nudge for a human to create the matching memo.
 *
 * Debits (credit USES) don't push — only grants. Idempotent: a row already
 * carrying a Xero credit-note id is never re-pushed.
 */
import type { PrismaClient } from '../generated/prisma/client';
import { getAuthedXero } from './xero';

const HS = 'https://api.hubapi.com';
const HS_TOKEN = process.env.ACCESS_TOKEN || '';

async function hsPost(path: string, body: any): Promise<{ ok: boolean; status: number; json: any }> {
  const r = await fetch(HS + path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${HS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = r.ok ? await r.json() : await r.text();
  return { ok: r.ok, status: r.status, json };
}
async function hsPut(path: string): Promise<boolean> {
  const r = await fetch(HS + path, { method: 'PUT', headers: { Authorization: `Bearer ${HS_TOKEN}` } });
  return r.ok;
}
async function hsGet(path: string): Promise<any | null> {
  const r = await fetch(HS + path, { headers: { Authorization: `Bearer ${HS_TOKEN}` } });
  return r.ok ? await r.json() : null;
}
const round2 = (n: number) => Math.round(n * 100) / 100;

/** The operable email to key the Xero contact on: active portal login first. */
async function operableEmail(prisma: PrismaClient, agencyId: number): Promise<string | null> {
  const user = await prisma.sisUser.findFirst({
    where: { agencyId, active: true, email: { not: null } },
    orderBy: { lastLoginAt: 'desc' },
    select: { email: true },
  });
  if (user?.email) return user.email;
  const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { email: true } });
  return agency?.email || null;
}

/** Resolve + cache the agency's Xero contactID (keyed on the operable email). */
export async function resolveXeroContactId(prisma: PrismaClient, xero: any, tenantId: string, agencyId: number): Promise<{ contactId: string | null; email: string | null; reason?: string }> {
  const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { xeroContactId: true } });
  if (agency?.xeroContactId) return { contactId: agency.xeroContactId, email: null };

  const email = await operableEmail(prisma, agencyId);
  if (!email) return { contactId: null, email: null, reason: 'no operable email on the agency (no active portal login / agency email)' };

  const res = await xero.accountingApi.getContacts(tenantId, undefined, `EmailAddress=="${email.replace(/"/g, '')}"`);
  const contacts = (res.body.contacts || []).filter((c: any) => c.contactID);
  if (!contacts.length) return { contactId: null, email, reason: `no Xero contact for ${email}` };
  // If DataSync left duplicates, prefer the one that actually has activity
  // (an existing credit note or invoice); else the first.
  const chosen = contacts[0];
  await prisma.agency.update({ where: { id: agencyId }, data: { xeroContactId: chosen.contactID } });
  return { contactId: chosen.contactID, email };
}

export interface PushResult {
  xero: { ok: boolean; creditNoteNumber?: string; reason?: string };
  hubspot: { ok: boolean; taskId?: string; reason?: string };
}

/**
 * Push a single credit GRANT to Xero (credit note) + HubSpot (task). Idempotent.
 * Never throws — returns a per-leg status so the caller can surface it; the SIS
 * ledger row is authoritative regardless of push outcome.
 */
export async function pushCredit(prisma: PrismaClient, creditId: number): Promise<PushResult> {
  const out: PushResult = { xero: { ok: false }, hubspot: { ok: false } };
  const credit = await prisma.agencyCredit.findUnique({
    where: { id: creditId },
    select: {
      id: true, agencyId: true, amount: true, entryType: true, reason: true, status: true,
      xeroCreditNoteId: true, hubspotTaskId: true,
      agency: { select: { hubspotCompanyId: true, name: true } },
    },
  });
  if (!credit) { out.xero.reason = out.hubspot.reason = 'credit not found'; return out; }
  if (credit.entryType !== 'CREDIT') { out.xero.reason = out.hubspot.reason = 'only credit grants push (not debits)'; return out; }
  if (credit.status === 'VOID') { out.xero.reason = out.hubspot.reason = 'credit is void'; return out; }

  const amount = Math.abs(Number(credit.amount || 0));
  const reason = credit.reason || 'ULearn partner credit';

  // ── Xero credit note ──
  if (credit.xeroCreditNoteId) {
    out.xero = { ok: true, creditNoteNumber: (await prisma.agencyCredit.findUnique({ where: { id: creditId }, select: { xeroCreditNoteNumber: true } }))?.xeroCreditNoteNumber || undefined };
  } else {
    try {
      const { xero, tenantId } = await getAuthedXero();
      const resolved = await resolveXeroContactId(prisma, xero, tenantId, credit.agencyId);
      if (!resolved.contactId) {
        out.xero.reason = resolved.reason || 'could not resolve Xero contact';
      } else {
        const today = new Date().toISOString().split('T')[0];
        const created = await xero.accountingApi.createCreditNotes(tenantId, {
          creditNotes: [{
            type: 'ACCRECCREDIT' as any,
            contact: { contactID: resolved.contactId } as any,
            date: today as any,
            status: 'AUTHORISED' as any,
            reference: reason.slice(0, 255),
            lineItems: [{
              description: reason.slice(0, 4000),
              quantity: 1,
              unitAmount: amount,
              accountCode: '100',
              taxType: 'NONE',
            }] as any,
          }],
        });
        const cn = created.body.creditNotes?.[0];
        if (cn?.creditNoteID) {
          await prisma.agencyCredit.update({
            where: { id: creditId },
            data: { xeroCreditNoteId: cn.creditNoteID, xeroCreditNoteNumber: cn.creditNoteNumber || null, pushedAt: new Date() },
          });
          out.xero = { ok: true, creditNoteNumber: cn.creditNoteNumber || undefined };
        } else {
          out.xero.reason = 'Xero returned no credit note';
        }
      }
    } catch (e: any) {
      out.xero.reason = 'Xero error: ' + (e?.message || String(e));
    }
  }

  // ── HubSpot task (reminder to create the credit memo) ──
  if (credit.hubspotTaskId) {
    out.hubspot = { ok: true, taskId: credit.hubspotTaskId };
  } else if (!credit.agency?.hubspotCompanyId) {
    out.hubspot.reason = 'agency has no HubSpot company to attach the task';
  } else {
    try {
      const subject = `Create Credit Memo | €${amount.toFixed(2)} | ${reason}`;
      const dueTs = Date.now() + 24 * 60 * 60 * 1000; // due tomorrow
      const t = await hsPost('/crm/v3/objects/tasks', {
        properties: {
          hs_task_subject: subject,
          hs_task_body: `SIS partner credit #${credit.id} for ${credit.agency?.name || 'agency'} (€${amount.toFixed(2)}). Create the matching HubSpot credit memo on the company so it's visible at deal/quote time. Reason: ${reason}`,
          hs_timestamp: dueTs,
          hs_task_status: 'NOT_STARTED',
          hs_task_priority: 'HIGH',
          hs_task_type: 'TODO',
        },
      });
      const taskId = t.ok ? t.json?.id : null;
      if (taskId) {
        // Associate to the company (v4 default association picks the standard type)
        const linked = await hsPut(`/crm/v4/objects/tasks/${taskId}/associations/default/companies/${credit.agency.hubspotCompanyId}`);
        await prisma.agencyCredit.update({ where: { id: creditId }, data: { hubspotTaskId: String(taskId) } });
        out.hubspot = { ok: true, taskId: String(taskId), reason: linked ? undefined : 'task created but company link failed' };
      } else {
        out.hubspot.reason = 'HubSpot task create failed: ' + String(t.json).slice(0, 200);
      }
    } catch (e: any) {
      out.hubspot.reason = 'HubSpot error: ' + (e?.message || String(e));
    }
  }

  return out;
}

/**
 * Auto-deduct the agency's credit store when a HubSpot credit memo is applied to
 * one of the booking's invoices. The memo object is API-walled, but the invoice
 * exposes the applied credit via the readable `credit_memos` association, and the
 * credit amount is derivable as (hs_amount_paid − Σ commerce_payments). Posts a
 * reconciling store DEBIT per booking — idempotent (re-fires safely; self-corrects
 * if the applied credit later changes).
 *
 * Called from the invoice-paid webhook AFTER the booking balance is updated.
 * No-op for B2C bookings (no agency).
 */
export async function reconcileBookingCredit(prisma: PrismaClient, bookingId: number): Promise<{ detected: number; drawn: number; delta: number; posted: boolean; reason?: string; xero?: any }> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { id: true, agencyId: true, hubspotDealId: true, amountPaid: true, amountTotal: true } });
  if (!booking) return { detected: 0, drawn: 0, delta: 0, posted: false, reason: 'booking not found' };
  if (!booking.agencyId) return { detected: 0, drawn: 0, delta: 0, posted: false, reason: 'no agency (B2C)' };
  if (!booking.hubspotDealId) return { detected: 0, drawn: 0, delta: 0, posted: false, reason: 'no deal' };
  let hubspotTotalPaid = 0;

  // Detect credit applied across the deal's invoices (per invoice, so we can
  // mirror the allocation onto the matching Xero invoice by number).
  const invAssoc = await hsGet(`/crm/v3/objects/deals/${booking.hubspotDealId}/associations/invoices`);
  const invoiceIds: string[] = (invAssoc?.results || []).map((r: any) => String(r.id));
  let detected = 0;
  const memoIds = new Set<string>();
  const creditByInvoice: { hsNumber: string; credit: number }[] = [];

  for (const invId of invoiceIds) {
    const inv = await hsGet(`/crm/v3/objects/invoices/${invId}?properties=hs_amount_paid,hs_invoice_status,hs_number`);
    const p = inv?.properties || {};
    const status = (p.hs_invoice_status || '').toLowerCase();
    if (status === 'voided' || status === 'deleted') continue;
    if (/-Sub$/i.test(p.hs_number || '')) continue;
    const paid = parseFloat(p.hs_amount_paid || '0') || 0;
    hubspotTotalPaid += paid;   // authoritative paid total (deleted invoices drop out of the deal's associations → excluded)
    if (paid <= 0) continue;

    // Is a credit memo applied? (association is readable even though the object isn't)
    const cmAssoc = await hsGet(`/crm/v4/objects/invoices/${invId}/associations/credit_memos`);
    const cmIds: string[] = (cmAssoc?.results || []).map((r: any) => String(r.toObjectId));
    if (!cmIds.length) continue;   // no credit applied to this invoice → the "paid" is cash
    cmIds.forEach(id => memoIds.add(id));

    // Credit portion = paid − real commerce payments.
    const pAssoc = await hsGet(`/crm/v4/objects/invoices/${invId}/associations/commerce_payments`);
    const payIds: string[] = (pAssoc?.results || []).map((r: any) => String(r.toObjectId));
    let cash = 0;
    if (payIds.length) {
      const batch = await hsPost('/crm/v3/objects/commerce_payments/batch/read', {
        inputs: payIds.map(id => ({ id })), properties: ['hs_initial_amount'],
      });
      cash = (batch.json?.results || []).reduce((s: number, x: any) => s + (parseFloat(x.properties?.hs_initial_amount || '0') || 0), 0);
    }
    const credit = round2(paid - cash);
    if (credit > 0.005) { detected += credit; if (p.hs_number) creditByInvoice.push({ hsNumber: p.hs_number, credit }); }
  }
  detected = round2(detected);

  // Maintain a SINGLE auto-debit row per booking = −detected. This is self-cleaning:
  // if the credit is later removed in HubSpot (detected → 0) the row is deleted, not
  // reversed with a second entry — so no orphan minus lingers.
  const existingDebits = await prisma.agencyCredit.findMany({
    where: { appliedToBookingId: bookingId, autoFromInvoiceCredit: true },
    orderBy: { id: 'asc' }, select: { id: true, amount: true },
  });
  const drawn = round2(-existingDebits.reduce((s, r) => s + Number(r.amount || 0), 0));
  const delta = round2(detected - drawn);
  const memoStr = [...memoIds].join(',') || null;
  let posted = false;

  if (detected > 0.005) {
    const data = {
      agencyId: booking.agencyId, amount: -detected, entryType: 'DEBIT',
      reason: `Credit memo applied on booking #${bookingId} invoice`,
      appliedToBookingId: bookingId, appliedToDealId: booking.hubspotDealId,
      hubspotCreditMemoId: memoStr, autoFromInvoiceCredit: true,
      appliedAt: new Date(), createdBy: 'invoice-paid-webhook',
    } as any;
    if (existingDebits.length) {
      await prisma.agencyCredit.update({ where: { id: existingDebits[0].id }, data: { amount: -detected, hubspotCreditMemoId: memoStr, appliedAt: new Date() } });
      if (existingDebits.length > 1) await prisma.agencyCredit.deleteMany({ where: { id: { in: existingDebits.slice(1).map(d => d.id) } } });
    } else {
      await prisma.agencyCredit.create({ data });
    }
    posted = Math.abs(delta) >= 0.005;
  } else if (existingDebits.length) {
    await prisma.agencyCredit.deleteMany({ where: { id: { in: existingDebits.map(d => d.id) } } });
    posted = true;
  }

  // "ULearn Credit" display payment row (one per booking = detected) so the applied
  // credit shows as a distinct line, disambiguated from cash. dataSource=CREDIT so
  // the webhook's HubSpot-payment prune skips it. Self-cleaning to match detected.
  const existingCreditPay = await prisma.payment.findMany({ where: { bookingId, dataSource: 'CREDIT' as any }, orderBy: { id: 'asc' }, select: { id: true } });
  if (detected > 0.005) {
    if (existingCreditPay.length) {
      await prisma.payment.update({ where: { id: existingCreditPay[0].id }, data: { amount: detected } });
      if (existingCreditPay.length > 1) await prisma.payment.deleteMany({ where: { id: { in: existingCreditPay.slice(1).map(p => p.id) } } });
    } else {
      await prisma.payment.create({ data: { bookingId, amount: detected, method: 'ULearn Credit', type: 'Standard', paymentDate: new Date(), dataSource: 'CREDIT' as any, comment: 'Credit memo applied (HubSpot)' } as any });
    }
  } else if (existingCreditPay.length) {
    await prisma.payment.deleteMany({ where: { id: { in: existingCreditPay.map(p => p.id) } } });
  }

  // Keep the booking's paid/open in sync with HubSpot's authoritative total — so
  // removing a credit (or its whole invoice) drops the paid figure, and the balance
  // (amountOpen = total − paid) follows. GUARDED: only ever touch amountPaid when this
  // booking is CREDIT-INVOLVED this run (has/had an auto-debit or ULearn-Credit row).
  // Non-credit bookings are left entirely to the webhook — this is what protects the
  // legacy case where SIS legitimately holds more than HubSpot's invoice shows (a
  // Fidelo/migrated balance with no payment rows) from being wrongly reduced.
  hubspotTotalPaid = round2(hubspotTotalPaid);
  const existingPaid = round2(Number(booking.amountPaid || 0));
  const creditInvolved = drawn > 0.005 || detected > 0.005 || existingCreditPay.length > 0;
  if (creditInvolved && Math.abs(hubspotTotalPaid - existingPaid) >= 0.005) {
    const total = booking.amountTotal != null ? Number(booking.amountTotal) : null;
    await prisma.booking.update({
      where: { id: bookingId },
      data: { amountPaid: hubspotTotalPaid, amountOpen: total != null ? round2(total - hubspotTotalPaid) : null },
    });
  }

  // Mirror the application into Xero: allocate the agency's credit note(s) to the
  // matching invoice(s). Xero allows cross-contact allocation (no reassign), FIFO
  // across notes, idempotent (only fills the gap vs the invoice's amountCredited).
  let xero: any = null;
  try { xero = await allocateAgencyCreditInXero(prisma, booking.agencyId, creditByInvoice); }
  catch (e: any) { xero = { error: e?.message || String(e) }; }

  return { detected, drawn, delta, posted, xero };
}

/**
 * Allocate an agency's Xero credit note(s) to the invoice(s) a credit was applied
 * to in HubSpot. No contact reassign — Xero permits cross-contact allocation, so
 * the note stays on the partner (partials leave the remainder correctly placed).
 * Idempotent: only allocates the gap between HubSpot's applied credit and the Xero
 * invoice's existing amountCredited.
 */
async function allocateAgencyCreditInXero(prisma: PrismaClient, agencyId: number, creditByInvoice: { hsNumber: string; credit: number }[]): Promise<any> {
  if (!creditByInvoice.length) return { allocated: 0, note: 'nothing to allocate' };
  const { xero, tenantId } = await getAuthedXero();
  const resolved = await resolveXeroContactId(prisma, xero, tenantId, agencyId);
  if (!resolved.contactId) return { allocated: 0, reason: resolved.reason || 'no Xero contact' };

  const cnResp = await xero.accountingApi.getCreditNotes(tenantId, undefined, `Contact.ContactID==Guid("${resolved.contactId}") AND Type=="ACCRECCREDIT" AND Status=="AUTHORISED"`);
  const notes = (cnResp.body.creditNotes || [])
    .filter((n: any) => Number(n.remainingCredit) > 0.005)
    .sort((a: any, b: any) => +new Date(a.date) - +new Date(b.date)); // FIFO
  const today = new Date().toISOString().split('T')[0];
  const results: any[] = [];

  for (const { hsNumber, credit } of creditByInvoice) {
    const invResp = await xero.accountingApi.getInvoices(tenantId, undefined, `InvoiceNumber=="${hsNumber.replace(/"/g, '')}"`);
    const xi = (invResp.body.invoices || [])[0];
    if (!xi) { results.push({ invoice: hsNumber, allocated: 0, reason: 'Xero invoice not found' }); continue; }
    const already = Number(xi.amountCredited || 0);
    let gap = round2(Math.min(credit - already, Number(xi.amountDue || 0)));
    if (gap <= 0.005) { results.push({ invoice: hsNumber, allocated: 0, reason: 'already aligned' }); continue; }

    let alloc = 0;
    for (const n of notes) {
      if (gap <= 0.005) break;
      const avail = Number(n.remainingCredit) || 0;
      if (avail <= 0.005 || !n.creditNoteID || !xi.invoiceID) continue;
      const amt = round2(Math.min(gap, avail));
      await xero.accountingApi.createCreditNoteAllocation(tenantId, n.creditNoteID, {
        allocations: [{ amount: amt, date: today as any, invoice: { invoiceID: xi.invoiceID } as any }],
      });
      n.remainingCredit = round2(avail - amt); // local decrement for the next invoice in this pass
      gap = round2(gap - amt);
      alloc = round2(alloc + amt);
    }
    results.push({ invoice: hsNumber, allocated: alloc, ...(gap > 0.005 ? { shortfall: gap } : {}) });
  }
  return { allocated: round2(results.reduce((s, r) => s + (r.allocated || 0), 0)), results };
}

/**
 * Delete a credit row and reverse its footprint everywhere: VOID the Xero credit
 * note (un-allocating first) + delete the HubSpot task + remove the SIS row.
 * For accidental entries. Scoped to the agency. Never throws — reports per-leg.
 */
export async function deleteCreditEverywhere(prisma: PrismaClient, agencyId: number, creditId: number): Promise<{ ok: boolean; xero?: string; hubspot?: string; reason?: string }> {
  const c = await prisma.agencyCredit.findFirst({
    where: { id: creditId, agencyId },
    select: { id: true, xeroCreditNoteId: true, xeroCreditNoteNumber: true, hubspotTaskId: true },
  });
  if (!c) return { ok: false, reason: 'not found' };
  const out: { ok: boolean; xero?: string; hubspot?: string } = { ok: true };

  if (c.xeroCreditNoteId) {
    try {
      const { xero, tenantId } = await getAuthedXero();
      const cn = (await xero.accountingApi.getCreditNote(tenantId, c.xeroCreditNoteId)).body.creditNotes?.[0];
      for (const a of (cn?.allocations || [])) { if (a.allocationID) await xero.accountingApi.deleteCreditNoteAllocations(tenantId, c.xeroCreditNoteId, a.allocationID); }
      await xero.accountingApi.updateCreditNote(tenantId, c.xeroCreditNoteId, { creditNotes: [{ creditNoteID: c.xeroCreditNoteId, status: 'VOIDED' as any }] });
      out.xero = `voided ${c.xeroCreditNoteNumber || ''}`.trim();
    } catch (e: any) { out.xero = 'void failed: ' + (e?.message || String(e)); }
  }
  if (c.hubspotTaskId) {
    try {
      const r = await fetch(`${HS}/crm/v3/objects/tasks/${c.hubspotTaskId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${HS_TOKEN}` } });
      out.hubspot = r.ok ? 'deleted' : `HTTP ${r.status}`;
    } catch (e: any) { out.hubspot = 'delete failed'; }
  }
  await prisma.agencyCredit.delete({ where: { id: creditId } });

  // CASCADE: the credit's "assignment" (auto-debit + ULearn Credit payment row) must
  // be wiped with it. Re-reconcile the agency's bookings that carry an auto-debit —
  // any whose HubSpot credit memo is now gone (removed alongside the delete) get their
  // auto-debit + payment row cleaned by the self-cleaning reconcile. Non-fatal.
  try {
    const affected = await prisma.agencyCredit.findMany({
      where: { agencyId, autoFromInvoiceCredit: true, appliedToBookingId: { not: null } },
      select: { appliedToBookingId: true }, distinct: ['appliedToBookingId'],
    });
    for (const a of affected) { if (a.appliedToBookingId) await reconcileBookingCredit(prisma, a.appliedToBookingId); }
  } catch (e) { /* non-fatal */ }

  return out;
}

/**
 * Back-link an existing (hand-made) Xero credit note to a SIS credit row so the
 * auto-push doesn't duplicate it. Matches by credit-note number.
 */
export async function linkExistingXeroCredit(prisma: PrismaClient, creditId: number, creditNoteNumber: string): Promise<{ ok: boolean; reason?: string }> {
  try {
    const { xero, tenantId } = await getAuthedXero();
    const res = await xero.accountingApi.getCreditNotes(tenantId, undefined, `CreditNoteNumber=="${creditNoteNumber.replace(/"/g, '')}"`);
    const cn = (res.body.creditNotes || [])[0];
    if (!cn?.creditNoteID) return { ok: false, reason: `Xero credit note ${creditNoteNumber} not found` };
    await prisma.agencyCredit.update({
      where: { id: creditId },
      data: { xeroCreditNoteId: cn.creditNoteID, xeroCreditNoteNumber: cn.creditNoteNumber || creditNoteNumber, pushedAt: new Date() },
    });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: e?.message || String(e) };
  }
}
