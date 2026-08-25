import { getAuthedXero } from './xero';

// LifePass instalment reconciliation — reads the Xero -Sub MASTER invoice (the
// back-end ledger the student never sees) and marks drawdowns paid FIFO.
//
// Model (Neil): the €297 subs "just stack in order". Every full €297 on the
// invoice fills the next pending instalment — so N full payments → the first N
// sequences are `allocated`, regardless of which month the payer thinks they're
// covering (a late payer's next €297 backfills the earliest overdue slot).
//
// Source of truth is XERO (bank rec happens there, then syncs to HubSpot).
// Idempotent + reversible: re-running only advances the waterline, and a refund
// (amountPaid receding) rolls the affected drawdowns back to `pending`.
const LPS_UNIT = 297;

export async function reconcileLifePassInstalments(prisma: any, bookingId: number) {
  const base = { bookingId, invoice: null as string | null, amountPaid: 0, paidCount: 0, allocated: 0, cleared: 0, total: 0 };

  const rows = await prisma.paymentInstalment.findMany({
    where: { bookingId, cancelledAt: null },
    orderBy: { sequence: 'asc' },
  });
  if (!rows.length) return { ...base, message: 'no instalments for booking' };
  base.total = rows.length;

  const subNumber: string | undefined = rows.map((r: any) => r.xeroInvoiceNumber).find(Boolean);
  if (!subNumber) return { ...base, message: 'no xeroInvoiceNumber stamped on instalments' };
  base.invoice = subNumber;

  // Read the master -Sub invoice from Xero (same call the seeder uses).
  const { xero, tenantId } = await getAuthedXero();
  const resp = await xero.accountingApi.getInvoices(tenantId, undefined, undefined, undefined, undefined, [subNumber]);
  const inv: any = (resp.body.invoices || []).find((i: any) => i.invoiceNumber === subNumber);
  if (!inv) return { ...base, message: `Xero invoice ${subNumber} not found` };

  const amountPaid = Number(inv.amountPaid || 0);
  const paidCount = Math.min(rows.length, Math.floor(amountPaid / LPS_UNIT));
  base.amountPaid = amountPaid;
  base.paidCount = paidCount;

  // Xero payments oldest-first — payment #n backs instalment #n, so paidAt/ref
  // reflect the actual payment that filled each slot.
  const payments = (inv.payments || []).slice().sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  for (const row of rows) {
    const within = row.sequence <= paidCount;
    if (within && row.allocationStatus !== 'allocated') {
      const pay = payments[row.sequence - 1];
      await prisma.paymentInstalment.update({
        where: { id: row.id },
        data: {
          allocationStatus: 'allocated',
          paidAt: pay?.date ? new Date(pay.date) : new Date(),
          paymentProvider: 'xero',
          paymentRef: pay?.paymentID || pay?.reference || null,
        },
      });
      base.allocated++;
    } else if (!within && row.allocationStatus === 'allocated') {
      // Waterline receded (refund/reversal) — roll the drawdown back.
      await prisma.paymentInstalment.update({
        where: { id: row.id },
        data: { allocationStatus: 'pending', paidAt: null, paymentProvider: null, paymentRef: null },
      });
      base.cleared++;
    }
  }
  return base;
}
