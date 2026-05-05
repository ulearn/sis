// One-off diagnostic for booking #17 (Felix Edgardo Lopez Rivera).
// Reports the raw SIS row + linked invoices/payments so we can see whether
// 12,480 / 11,080 came from a real HubSpot deal, a Fidelo import, or got
// inflated by a sync bug.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  const b: any = await prisma.booking.findUnique({
    where: { id: 17 },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      courses: { select: { name: true, level: true, fee: true, weeks: true, startDate: true, endDate: true } },
      accommodations: { select: { accommodationType: true, fee: true, startDate: true, endDate: true } },
      extras: { select: { extraType: true, details: true, fee: true } },
    },
  });
  if (!b) { console.log('Booking #17 not found'); process.exit(1); }

  console.log('=== Booking #17 ===');
  console.log('Student:        ', b.student?.firstName, b.student?.lastName, '(' + b.student?.email + ')');
  console.log('Status:         ', b.status, '(confirmed:', b.confirmed + ')');
  console.log('Service window: ', b.serviceStart?.toISOString().slice(0,10), '→', b.serviceEnd?.toISOString().slice(0,10));
  console.log('Currency:       ', b.currency);
  console.log('amountTotal:    ', String(b.amountTotal));
  console.log('amountPaid:     ', String(b.amountPaid));
  console.log('amountOpen:     ', String(b.amountOpen));
  console.log('amountRefund:   ', String(b.amountRefund));
  console.log('regFee:         ', String(b.regFee));
  console.log('placementFee:   ', String(b.placementFee));
  console.log('dataSource:     ', b.dataSource);
  console.log('hubspotDealId:  ', b.hubspotDealId);
  console.log('hubspotInvoiceId:', b.hubspotInvoiceId);
  console.log('fideloBookingId:', b.fideloBookingId);
  console.log('note:           ', b.note);
  console.log('');
  console.log('Courses (' + b.courses.length + '):');
  for (const c of b.courses) console.log('  -', c.name, '·', c.level, '·', c.weeks + 'wks', '· fee €' + c.fee);
  console.log('Accommodations (' + b.accommodations.length + '):');
  for (const a of b.accommodations) console.log('  -', a.accommodationType, '· fee €' + a.fee, '·', a.startDate?.toISOString().slice(0,10), '→', a.endDate?.toISOString().slice(0,10));
  console.log('Extras (' + b.extras.length + '):');
  for (const e of b.extras) console.log('  -', e.extraType, e.details ? '(' + e.details + ')' : '', '· €' + e.fee);

  // Sum the line items to see if they reconcile to amountTotal
  const sum = (arr: any[]) => arr.reduce((s, x) => s + (Number(x.fee) || 0), 0);
  const lineSum = sum(b.courses) + sum(b.accommodations) + sum(b.extras)
                + (Number(b.regFee) || 0) + (Number(b.placementFee) || 0);
  console.log('');
  console.log('Sum of line-item fees + regFee + placementFee: €' + lineSum.toFixed(2));
  console.log('vs amountTotal stored:                          €' + String(b.amountTotal));
  console.log('diff:                                           €' + (Number(b.amountTotal) - lineSum).toFixed(2));

  // Payments table
  const payments: any[] = await (prisma as any).payment.findMany({
    where: { bookingId: 17 },
    orderBy: { id: 'asc' },
  }).catch(() => []);
  console.log('');
  console.log('Payment rows (' + payments.length + '):');
  let paidSum = 0;
  for (const p of payments) {
    const amt = Number(p.amount) || 0;
    paidSum += amt;
    console.log('  -', '€' + amt.toFixed(2), '·', p.dataSource, '·', p.paidAt?.toISOString().slice(0,10) || '—', '· hsPaymentId:', p.hubspotPaymentId);
  }
  console.log('Sum of payment rows: €' + paidSum.toFixed(2));
  console.log('vs amountPaid stored: €' + String(b.amountPaid));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
