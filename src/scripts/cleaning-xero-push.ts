// Weekly turnover billing → Natia's Xero Bill.
//
// Counts how many cleaning rows have been marked Done in the current ISO
// week (Mon–Sun) for a given provider, then finds the cleaner's open
// ACCPAY Bill and updates the existing "CheckIn/Checkout" line item's
// quantity (or appends one if missing). Does NOT touch her Cleaning
// Hours line — that's still managed manually / via the recurring template.
//
// Idempotent: clicking Push twice in the same week sets qty to the
// current count, doesn't increment.
//
// MVP assumptions:
//   - One cleaner per call (the first active one with a Xero contact ID).
//     Easy to extend to per-provider cleaner later.
//   - Bill must already exist as DRAFT/SUBMITTED/AUTHORISED. The recurring
//     template fires on Monday; if pushed before that we surface a clear
//     error pointing at the next firing date.

import { PrismaClient } from '../generated/prisma/client';
import { getAuthedXero } from './xero';
import { accommodationScripts } from './accommodation';

const CHECKIN_DESC = 'Check In/Out';
const CHECKIN_ACCT = 'B129';
const OPEN_STATUSES = ['DRAFT', 'SUBMITTED', 'AUTHORISED'];

function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function pushCleaningToXero(
  prisma: PrismaClient,
  providerId: number,
  weekOffset: number = 0
): Promise<{
  count: number;
  unitPrice: number;
  total: number;
  billNumber: string;
  billStatus: string;
  billId: string;
  cleaner: string;
  weekOf: string;
}> {
  // 1) Resolve cleaner — MVP: first active one with a Xero contact ID
  const cleaner = await prisma.cleaner.findFirst({
    where: { active: true, xeroContactId: { not: null } },
    orderBy: { id: 'asc' },
  });
  if (!cleaner) throw new Error('No cleaner configured (need a row in cleaners with xero_contact_id)');
  if (!cleaner.xeroContactId) throw new Error('Cleaner has no xero_contact_id');

  // 2) Count cleanedAt placements within current week, scoped to this provider
  const provider = await prisma.accommodationProvider.findUnique({
    where: { id: providerId },
    select: { id: true, name: true, cleaningEnabled: true },
  });
  if (!provider) throw new Error('Provider not found');
  if (!provider.cleaningEnabled) throw new Error('Cleaning not enabled on this provider');

  // Source the count from getCleaningQueue so the Xero quantity matches the
  // grouped, PER-ROOM view (Option B) — a couple sharing a 2-bed room is one
  // turnover, not two; only genuinely shared rooms (Twin/Shared) bill per bed.
  const { items } = await accommodationScripts(prisma).getCleaningQueue(providerId);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const thisMonday = mondayOf(today); // current ISO-week Monday — labels weekOf AND scopes billing

  // Bill ONLY this week's turnovers. The queue window is deliberately wide
  // (last-Monday → +28d) so Kelly can verify last weekend's cleans on a Monday,
  // but a checkout CLEANED in a prior week was already billed on that week's
  // bill — re-counting it here double-pays Natia (issue #50: "old entities
  // polluting the current week output"). Scope to cleanedAt in the current ISO
  // week so each turnover is billed exactly once, in the week it was cleaned.
  //
  // Belt-and-braces (issue #50): a turnover is stamped `cleanBilledAt` once it's
  // billed. We EXCLUDE any turnover already billed on a PRIOR week's (closed)
  // bill — that's the only way a re-mark could otherwise double-pay. A turnover
  // billed THIS week (billedAt >= thisMonday) stays in the set so the SET-based
  // quantity remains idempotent across repeated pushes in the same week.
  const billable = items.filter((i: any) => {
    if (!i.cleanedAt || new Date(i.cleanedAt) < thisMonday) return false;     // this week's cleans only
    if (i.billedAt && new Date(i.billedAt) < thisMonday) return false;        // already billed on a prior bill → never again
    return true;
  });
  const count = billable.length;

  if (count === 0) {
    throw new Error('Nothing marked Done this week yet — nothing to push');
  }

  const unitPrice = Number(cleaner.perTurnoverFee);

  // 3) Find Natia's open Bill
  const { xero, tenantId } = await getAuthedXero();
  const bills = await xero.accountingApi.getInvoices(
    tenantId,
    undefined,
    'Type=="ACCPAY"',
    'Date DESC',
    undefined,
    undefined,
    [cleaner.xeroContactId],
    OPEN_STATUSES
  );
  const open = (bills.body.invoices || []).filter((i) => OPEN_STATUSES.includes(String(i.status)));
  if (open.length === 0) {
    throw new Error(
      'No open Bill found for ' + cleaner.name + '. The recurring template likely hasn\'t fired yet — check back after Monday.'
    );
  }
  const bill = open[0]; // most recent open Bill

  // 4) Update existing CheckIn/Out line OR append a new one. Preserve
  // every other line (Cleaning Hours etc.) untouched.
  //
  // IMPORTANT: strip lineAmount on every line. When the recurring template
  // fires with qty 0, Xero stores lineAmount=0; if we echo that back with
  // a new quantity, Xero rejects with "line total X does not match expected Y".
  // Omitting lineAmount lets Xero recompute server-side. We also strip taxAmount
  // for the same reason.
  const stripComputed = (li: any) => {
    const { lineAmount, taxAmount, ...rest } = li || {};
    return rest;
  };
  const lines = (bill.lineItems || []).map((li: any) => stripComputed(li));
  let lineIdx = lines.findIndex((li: any) =>
    String(li.description || '').toLowerCase().includes('checkin') ||
    String(li.description || '').toLowerCase().includes('check in')
  );
  if (lineIdx === -1) {
    lines.push({
      description: CHECKIN_DESC,
      quantity: count,
      unitAmount: unitPrice,
      accountCode: CHECKIN_ACCT,
    });
    lineIdx = lines.length - 1;
  } else {
    lines[lineIdx] = {
      ...lines[lineIdx],
      description: CHECKIN_DESC,
      quantity: count,
      unitAmount: unitPrice,
      accountCode: CHECKIN_ACCT,
    };
    // accountId is paired with accountCode in Xero's response — drop it
    // so the server resolves the correct account from the new code.
    delete (lines[lineIdx] as any).accountId;
    delete (lines[lineIdx] as any).accountID;
  }

  // 5) Save the update via updateOrCreateInvoices (which will update by InvoiceID)
  const updated = await xero.accountingApi.updateOrCreateInvoices(tenantId, {
    invoices: [
      {
        invoiceID: bill.invoiceID,
        lineItems: lines as any,
      } as any,
    ],
  });

  const after = updated.body.invoices?.[0] || bill;

  // Stamp every bed-placement of the billed turnovers so none can be billed
  // again — AFTER the Xero write succeeds. If the write throws we never reach
  // here, so nothing is stamped and a re-push simply re-SETs the same quantity
  // (SET semantics ⇒ no double-count). The stamp only ever prevents billing;
  // it never causes it, so any failure errs to UNDER-billing, never a duplicate.
  const billedIds = billable.flatMap((i: any) => (i.ids && i.ids.length ? i.ids : [i.id]));
  if (billedIds.length) {
    await prisma.bookingAccommodation.updateMany({
      where: { id: { in: billedIds } },
      data: { cleanBilledAt: new Date() },
    });
  }

  return {
    count,
    unitPrice,
    total: count * unitPrice,
    billNumber: after.invoiceNumber || '(unnumbered)',
    billStatus: String(after.status),
    billId: after.invoiceID || '',
    cleaner: cleaner.name,
    weekOf: thisMonday.toISOString().slice(0, 10),
  };
}
