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

  // Window must match getCleaningQueue: last week's Monday → +28 days.
  // Anything marked Done that's visible in Kelly's list should be pushed.
  // (Previous version used strict this-week-Mon→Sun and dropped weekend
  // turnovers cleaned the prior Sat/Sun — they were on screen but not in
  // the count.)
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const thisMonday = mondayOf(today);
  const monday = new Date(thisMonday); monday.setDate(monday.getDate() - 7);
  const horizon = new Date(today.getTime() + 28 * 86400000);

  const count = await prisma.bookingAccommodation.count({
    where: {
      cleanedAt: { not: null },
      endDate: { gte: monday, lte: horizon },
      cleanCancelledAt: null,
      bed: { is: { room: { is: { property: { is: { providerId } } } } } },
    },
  });

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
