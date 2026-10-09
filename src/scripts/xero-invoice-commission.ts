import { getAuthedXero } from './xero';
import { isCohortException } from './cohort-exceptions';
import https from 'https';

const HS_TOKEN = process.env.ACCESS_TOKEN!;

// Xero Revenue account for the card-surcharge line ("add fees" buyer surcharge
// that HubSpot bakes into hs_amount_billed at checkout). Its own income account
// so it (a) reconciles the invoice total to the gross the customer paid, (b)
// does NOT inflate course sales (100), and (c) does NOT duplicate the Stripe
// processing fee, which is reconciled separately via the Stripe bank feed.
const SURCHARGE_ACCOUNT_CODE = 'CRSC';

function hsGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.hubapi.com', path,
      headers: { 'Authorization': `Bearer ${HS_TOKEN}` },
    }, (res) => {
      let data = '';
      res.on('data', (c: string) => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

function hsPost(path: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.hubapi.com', path, method: 'POST',
      headers: { 'Authorization': `Bearer ${HS_TOKEN}`, 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', (c: string) => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

type Result =
  | { status: 'skipped'; reason: string }
  | { status: 'unchanged'; invoiceNumber: string }
  | { status: 'no-contact'; email: string }
  | { status: 'created'; invoiceNumber: string; xeroInvoiceID: string; total: number }
  | { status: 'duplicate-fell-through-to-update'; invoiceNumber: string; commissionAdded: boolean }
  | { status: 'dry-run'; invoiceNumber: string; computedTotal: number; feesTotal: number; lines: any[] }
  | { status: 'error'; message: string; details?: any };

/**
 * Create a Xero invoice mirroring a HubSpot invoice, with the partner commission
 * as a negative-amount line item. Bypasses HubSpot's DataSync entirely for B2B
 * cases (DataSync's behaviour is unreliable: sometimes it syncs at gross, sometimes
 * it fails outright, always strips the quote-level Global Discount).
 *
 * The Xero invoice we create uses the SAME invoice number as the HubSpot invoice
 * (e.g. INV-1040 in both). If DataSync ever does manage to also sync the same
 * invoice, the two entities co-exist as parallel records with the same number —
 * accepted tradeoff per design conversation.
 *
 * Idempotency:
 *   - If a Xero invoice with this number already exists (DataSync raced us, or
 *     this is a re-fire), we don't try to create again. Instead we add the
 *     commission line to the existing invoice if it's not already there.
 *
 * Inputs come from the webhook handler scope (no extra HubSpot fetches needed
 * for line items / contact — already in scope when this is called).
 */
export async function createXeroInvoiceFromHubSpot(input: {
  hubspotInvoiceId: string;
  hubspotDealId: string;
  dryRun?: boolean;   // build + return the payload/total without touching Xero
}): Promise<Result> {
  if (!input.hubspotInvoiceId) {
    return { status: 'skipped', reason: 'no hubspot invoice id' };
  }
  if (!input.hubspotDealId) {
    return { status: 'skipped', reason: 'no hubspot deal id' };
  }

  // Resolve the STUDENT contact + the agency name from the deal.
  //
  // Why student-first (was agency-first until 2026-05-20): when 60 students
  // come through the same agency, stacking 60 Xero invoices under the agency
  // contact makes payment reconciliation impossible — incoming bank lines
  // can't be matched back to a specific invoice/student. With each invoice
  // under its own STUDENT contact in Xero, agency-paid bank lines can be
  // resolved by invoice number → student → invoice in one step.
  //
  // The agency is still the legal payer in the real world; we keep their name
  // visible on the Xero invoice via the negative-amount "Partner Commission"
  // line description ("Partner Commission — {agencyName}") so context is
  // never lost. Agency name no longer drives Xero contact selection though.
  //
  // For B2B deals with multiple HubSpot contacts (student + agent + parent),
  // filter on the contact `type` property to specifically pick the student —
  // mirrors the pattern already in createLifePassSubscriptionInvoice.
  const HS_CONTACT_TYPE_PROPERTY = process.env.HUBSPOT_CONTACT_TYPE_PROPERTY || 'type';
  let agencyName: string | null = null;
  let studentEmail: string | null = null;
  try {
    const compAssoc = await hsGet(`/crm/v4/objects/deals/${input.hubspotDealId}/associations/companies`);
    const companyIds = (compAssoc.results || []).map((r: any) => String(r.toObjectId)).filter(Boolean);
    if (companyIds.length > 0) {
      const c = await hsGet(`/crm/v3/objects/companies/${companyIds[0]}?properties=name`);
      agencyName = c?.properties?.name || null;
    }
  } catch (e: any) {
    console.warn(`[Xero Invoice] failed to resolve agency: ${e.message}`);
  }
  try {
    const contactAssoc = await hsGet(`/crm/v4/objects/deals/${input.hubspotDealId}/associations/contacts`);
    const contactIds = (contactAssoc.results || []).map((r: any) => String(r.toObjectId)).filter(Boolean);
    if (contactIds.length === 1) {
      // Single contact on deal — almost always Student-B2C, occasionally a B2B
      // with the student as the only contact. Take it.
      const c = await hsGet(`/crm/v3/objects/contacts/${contactIds[0]}?properties=email`);
      studentEmail = c?.properties?.email || null;
    } else if (contactIds.length > 1) {
      // Multi-contact deal — pick the one whose type starts with "student".
      const batch = await hsPost('/crm/v3/objects/contacts/batch/read', {
        inputs: contactIds.map((id: string) => ({ id })),
        properties: [HS_CONTACT_TYPE_PROPERTY, 'email'],
      });
      const studentContact = (batch?.results || []).find((c: any) => {
        const t = String(c?.properties?.[HS_CONTACT_TYPE_PROPERTY] || '').toLowerCase();
        return t.startsWith('student');
      });
      studentEmail = studentContact?.properties?.email || null;
      // Last-resort fallback if no contact tagged Student-* — take the first
      // contact's email so we still create something rather than failing open.
      if (!studentEmail) {
        const c = await hsGet(`/crm/v3/objects/contacts/${contactIds[0]}?properties=email`);
        studentEmail = c?.properties?.email || null;
      }
    }
  } catch (e: any) {
    console.warn(`[Xero Invoice] failed to resolve student contact: ${e.message}`);
  }

  if (!studentEmail && !agencyName) {
    return { status: 'skipped', reason: 'neither student email nor agency name resolved from deal' };
  }

  // 1. Fetch HubSpot invoice with associations + commission discount total.
  const invoiceProps = [
    'hs_number',
    'hs_order_level_discounts_total',
    'hs_amount_billed',
    'hs_fees_total',          // buyer card/SEPA surcharge baked into hs_amount_billed at checkout
    'hs_currency_code',
    'hs_invoice_date',
    'hs_due_date',
    'createdate',
  ].join(',');
  const hsInvoice = await hsGet(
    `/crm/v3/objects/invoices/${input.hubspotInvoiceId}?properties=${invoiceProps}&associations=line_items`
  );

  const ip = hsInvoice?.properties || {};
  const invoiceNumber = ip.hs_number;
  // Gate: ONLY a HubSpot invoice carrying an ACTUAL order-level discount (> 0) is
  // ours to build in Xero — because DataSync can't represent global discounts. Any
  // invoice WITHOUT one (the field is unset, or present but "0.00") is a standard
  // invoice that DataSync syncs cleanly, so we MUST stay out of its lane: building it
  // ourselves either races DataSync to the invoice number or leaves a stray Xero
  // invoice DataSync then can't sync. Gate on the VALUE > 0, never on field presence
  // — "0.00" is present but means no discount (see the INV-1359 / INV-1362 precedent
  // and the cohort gate on the hub payment-sync cron).
  const commissionEUR = parseFloat(ip.hs_order_level_discounts_total || '0') || 0;
  if (!invoiceNumber) {
    return { status: 'skipped', reason: 'invoice has no hs_number' };
  }
  // Gate on discount VALUE > 0 — UNLESS the invoice/deal is on the manual cohort
  // exceptions list (a standard invoice DataSync is failing to handle, which we've
  // chosen to own; see data/cohort-exceptions.json). The paid-invoice guard below
  // still protects any already-settled exception from being re-authored.
  if (commissionEUR <= 0 && !isCohortException(input.hubspotDealId, invoiceNumber)) {
    return { status: 'skipped', reason: 'no order-level discount (standard invoice — DataSync owns it)' };
  }

  // 2. Fetch line items from HubSpot
  const liAssocKey = hsInvoice.associations?.['line items'] || hsInvoice.associations?.line_items;
  const lineItemIds = (liAssocKey?.results || []).map((r: any) => r.id);
  let lineItems: any[] = [];
  if (lineItemIds.length > 0) {
    const liData = await hsPost('/crm/v3/objects/line_items/batch/read', {
      inputs: lineItemIds.map((id: string) => ({ id })),
      properties: ['name', 'quantity', 'price', 'hs_discount_percentage', 'amount'],
    });
    lineItems = liData.results || [];
  }

  // 3. Look up the Xero contact for the STUDENT by email (DataSync syncs every
  //    HubSpot contact to a Xero contact keyed on email, so the student should
  //    already exist there). Agency is only used as a last-resort fallback for
  //    historical-gap cases where a student contact never made it across to
  //    Xero — that lets the create still succeed rather than blocking the
  //    whole flow. The agency name still surfaces on the commission line, so
  //    reporting is unaffected by which path was taken.
  const { xero, tenantId } = await getAuthedXero();

  let xeroContact: any = null;
  let contactSource: 'student' | 'agency-fallback' | null = null;
  if (studentEmail) {
    const r = await xero.accountingApi.getContacts(
      tenantId, undefined,
      `EmailAddress=="${studentEmail.replace(/"/g, '\\"')}"`,
    );
    xeroContact = r.body.contacts?.[0];
    if (xeroContact?.contactID) contactSource = 'student';
  }
  if (!xeroContact?.contactID && agencyName) {
    const r = await xero.accountingApi.getContacts(
      tenantId, undefined,
      `Name=="${agencyName.replace(/"/g, '\\"')}"`,
    );
    xeroContact = r.body.contacts?.[0];
    if (xeroContact?.contactID) {
      contactSource = 'agency-fallback';
      console.warn(`[Xero Invoice] student email ${studentEmail || '(none)'} not found in Xero — falling back to agency "${agencyName}" as contact (reconciliation will be ambiguous)`);
    }
  }
  if (!xeroContact?.contactID) {
    return { status: 'no-contact', email: studentEmail || agencyName || '(none)' };
  }

  // 4. Idempotency / reconciliation.
  //    SCOPE: this function runs for ANY HubSpot invoice carrying a global /
  //    order-level discount (gated above on hs_order_level_discounts_total > 0).
  //    HubSpot's Xero DataSync cannot represent global discounts faithfully,
  //    so we own the Xero side for every such invoice — whether the discount
  //    is a partner commission, a LifePass discount, a goodwill €100-off, a
  //    0% partner commission line, or any other staff-applied deduction. The
  //    business contract: staff are free to add any discount in HubSpot
  //    however they like, and this code adapts. So "we own this Xero invoice"
  //    means "any invoice that reaches here," not "any invoice with a
  //    commission line description." Older code keyed on /commission/i on
  //    line descriptions to detect ownership — that was wrong for LifePass et
  //    al. and is gone.
  //
  //    If Xero already has an invoice with this number, RECONCILE it against
  //    current HubSpot (replace lineItems + dates). Without this, any
  //    post-create edit on the HubSpot side silently failed to propagate
  //    (Odgerel INV-1142 sat at €1606.50 in Xero while HubSpot moved to
  //    €1556.50). Guarded: never touch an invoice that already has payment
  //    applied (would re-author settled cash — manual reconciliation needed).
  const existingSearch = await xero.accountingApi.getInvoices(
    tenantId, undefined, undefined, undefined, undefined, [invoiceNumber],
  );
  const existing = (existingSearch.body.invoices || []).find((i: any) => i.invoiceNumber === invoiceNumber);
  if (existing) {
    const paidAlready = Number(existing.amountPaid || 0) > 0 || String(existing.status || '') === 'PAID';
    if (paidAlready) {
      console.warn(`[Xero Invoice] ${invoiceNumber} already has €${existing.amountPaid} paid in Xero — refusing to re-author. Manual reconciliation required.`);
      return { status: 'duplicate-fell-through-to-update', invoiceNumber, commissionAdded: false };
    }
  }

  // 5. Build Xero invoice payload from HubSpot line items + commission line.
  //    accountCode='100' across the board — matches what DataSync used in the
  //    earlier observed syncs (INV-1038, INV-1039). Refine per-product mapping
  //    later if needed.
  const xeroLines: any[] = lineItems.map((li: any) => {
    const p = li.properties || {};
    const qty = parseFloat(p.quantity || '1');
    const price = parseFloat(p.price || '0');
    const lineItem: any = {
      description: p.name || '',
      quantity: qty,
      unitAmount: price,
      accountCode: '100',
      taxType: 'NONE',
    };
    // Derive the line discount from HubSpot's authoritative NET amount rather
    // than trusting hs_discount_percentage — a LINE-ITEM discount may be stored
    // as a fixed euro amount (`discount`/`hs_total_discount`, hs_discount_percentage
    // null) OR a percentage, and both surface identically in `amount` (net of the
    // line discount). Reconstructing the rate from gross-vs-net captures either
    // representation, so Xero's recomputed line total matches hs_amount_billed to
    // the cent. Without this, a fixed line discount was silently dropped and the
    // Xero total came out OVER by the discount (e.g. INV-1463: €2570 vs billed €1970).
    const net = parseFloat(p.amount || '0');
    const gross = price * qty;
    if (gross > 0 && net >= 0 && net < gross) {
      lineItem.discountRate = Math.round(((1 - net / gross) * 100) * 1e4) / 1e4; // ≤4dp (Xero max)
    }
    return lineItem;
  });
  xeroLines.push({
    description: agencyName ? `Partner Commission — ${agencyName}` : 'Partner Commission',
    quantity: 1,
    unitAmount: -Math.abs(commissionEUR),
    accountCode: '100',
    taxType: 'NONE',
  });

  // Card-surcharge line. HubSpot's "add fees" bakes the buyer's checkout
  // surcharge into hs_amount_billed (it is NOT a line item, NOT the discount,
  // NOT tax) and exposes it cleanly as hs_fees_total. Without this line the
  // rebuilt Xero total is short by the surcharge and never matches the Stripe
  // receipt. Booked to its own Revenue account (CRSC) so it reconciles the
  // total to gross-paid without inflating course sales or touching the Stripe
  // processing-fee expense (which the Stripe bank feed reconciles separately).
  const feesTotal = Math.round((parseFloat(ip.hs_fees_total || '0') || 0) * 100) / 100;
  if (feesTotal > 0.01) {
    // Cross-check vs the residual implied by hs_amount_billed, to catch a billed
    // total that carries something OTHER than this fee (e.g. tax). The
    // pre-surcharge total should be Σ(per-line amount) − commission.
    const lineSum = lineItems.reduce((s: number, li: any) => s + (parseFloat(li.properties?.amount || '0') || 0), 0);
    const billed = parseFloat(ip.hs_amount_billed || '0') || 0;
    const residual = Math.round((billed - (lineSum - commissionEUR)) * 100) / 100;
    if (Math.abs(residual - feesTotal) > 0.01) {
      console.warn(`[Xero Invoice] ${invoiceNumber}: hs_fees_total (${feesTotal}) != billed-residual (${residual}) — billed may carry tax/other; using hs_fees_total, verify.`);
    }
    xeroLines.push({
      description: 'Card Surcharge',
      quantity: 1,
      unitAmount: feesTotal,
      accountCode: SURCHARGE_ACCOUNT_CODE,
      taxType: 'NONE',
    });
  } else if (feesTotal < -0.01) {
    console.warn(`[Xero Invoice] ${invoiceNumber}: negative hs_fees_total (${feesTotal}) — skipping surcharge line (should not occur).`);
  }

  const today = new Date().toISOString().split('T')[0];
  const invoiceDate = ip.hs_invoice_date ? new Date(ip.hs_invoice_date).toISOString().split('T')[0] : today;
  const dueDate     = ip.hs_due_date     ? new Date(ip.hs_due_date).toISOString().split('T')[0]     : today;

  // Xero totals a line as unitAmount × quantity × (1 − discountRate/100).
  const computedTotal = Math.round(xeroLines.reduce((s, l) => {
    const gross = (l.unitAmount || 0) * (l.quantity || 1);
    return s + (l.discountRate ? gross * (1 - l.discountRate / 100) : gross);
  }, 0) * 100) / 100;

  // Dry-run: return the computed payload + total without touching Xero.
  if (input.dryRun) {
    return { status: 'dry-run', invoiceNumber, computedTotal, feesTotal, lines: xeroLines };
  }

  // No-op guard: if the existing Xero invoice already totals what HubSpot now
  // says, don't re-author it. This lets a callers that reconcile unconditionally
  // (e.g. an authoritative ReSync that may only be a date change with zero
  // financial impact) invoke the builder freely — it writes to Xero ONLY when
  // the money actually moved. Total is a faithful proxy for "financials changed"
  // here because every line (incl. the commission and any line/global discount)
  // feeds it.
  //    Contact is part of "changed" too: an authoritative ReSync may repoint the
  //    invoice to a corrected recipient (student email fixed, or a B2C↔agency
  //    switch) with zero change to the money. If the resolved Xero contact no
  //    longer matches the invoice's current contact, fall through and update even
  //    when the total is identical.
  const contactMismatch = !!(existing && xeroContact?.contactID
    && existing.contact?.contactID
    && existing.contact.contactID !== xeroContact.contactID);
  if (existing && Math.abs(Number(existing.total || 0) - computedTotal) < 0.01 && !contactMismatch) {
    return { status: 'unchanged', invoiceNumber };
  }

  try {
    // Update existing (reconciled with current HubSpot state) — only when
    // there's no payment in Xero (paid-already guard handled above).
    if (existing) {
      const updated = await xero.accountingApi.updateInvoice(tenantId, existing.invoiceID!, {
        invoices: [{
          invoiceID: existing.invoiceID,
          // Repoint the recipient to the currently-resolved contact so a ReSync
          // corrects a wrong/changed billing party (guarded above: never runs on
          // an invoice that already has payment in Xero).
          contact: { contactID: xeroContact.contactID } as any,
          date: invoiceDate as any,
          dueDate: dueDate as any,
          reference: agencyName || undefined,
          lineItems: xeroLines as any,
        }],
      });
      const ui = updated.body.invoices?.[0];
      return {
        status: 'duplicate-fell-through-to-update',
        invoiceNumber,
        commissionAdded: true,
      };
    }

    // Create new
    const created = await xero.accountingApi.createInvoices(tenantId, {
      invoices: [{
        type: 'ACCREC' as any,
        contact: { contactID: xeroContact.contactID } as any,
        date: invoiceDate as any,
        dueDate: dueDate as any,
        invoiceNumber,
        // Reference is NOT part of any sync/match logic (DataSync,
        // payment-sync.js, /xero-payment-sync all key on invoiceNumber).
        // We use it as a human-readable agency tag for B2B so the
        // bookkeeper can filter "all invoices for {agency}" in Xero from
        // one column. B2C leaves it blank — student name is already on
        // the invoice (contact) so duplicating adds noise.
        reference: agencyName || undefined,
        currencyCode: (ip.hs_currency_code || 'EUR') as any,
        status: 'AUTHORISED' as any,
        lineItems: xeroLines,
      }],
    });
    const ci = created.body.invoices?.[0];
    return {
      status: 'created',
      invoiceNumber,
      xeroInvoiceID: ci?.invoiceID || '',
      total: ci?.total || 0,
    };
  } catch (e: any) {
    return {
      status: 'error',
      message: e?.message || 'unknown error',
      details: e?.response?.body || null,
    };
  }
}
