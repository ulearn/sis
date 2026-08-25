#!/usr/bin/env node
/**
 * One-off sweep: confirm every PENDING/PARTIAL booking whose balance is settled.
 *
 * The stored booking `status` goes stale — a PENDING/PARTIAL booking that's since
 * been fully paid (Fidelo backfill, or a payment assigned outside the invoice-paid
 * webhook) keeps the old label, so the student shows RED on the Students list even
 * though they're fully paid (Angelica Guérin / bk 17853). Going forward the payment
 * rollup auto-heals (autoConfirmPatch in scripts/bookings.ts); this clears the
 * existing backlog. Neil 2026-07-08.
 *
 * "Settled" is judged from NON-ESCROW payments (mirrors the rollup + autoConfirmPatch)
 * — NOT the stored amountPaid, which can be escrow-inflated on Fidelo imports — so a
 * visa-pending escrow booking is never wrongly confirmed. Only PENDING/PARTIAL are
 * touched (CANCELLED/ESCROW left alone), upgrade-only.
 *
 * Usage:
 *   node src/scripts/sweep-confirm-settled.js           # dry-run (default)
 *   node src/scripts/sweep-confirm-settled.js --apply    # confirm the settled ones
 */
require('dotenv').config({ quiet: true });
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../../dist/generated/prisma/client');

const APPLY = process.argv.includes('--apply');
const EPS = 0.01;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

(async () => {
  const bookings = await prisma.booking.findMany({
    where: { status: { in: ['PENDING', 'PARTIAL'] }, amountTotal: { gt: 0 } },
    select: { id: true, amountTotal: true, status: true, student: { select: { id: true, firstName: true, lastName: true } } },
  });
  const ids = bookings.map(b => b.id);
  console.log(`PENDING/PARTIAL bookings with a real total: ${bookings.length}`);

  // Non-escrow realPaid per booking, batched.
  const realPaidBy = new Map();
  for (let i = 0; i < ids.length; i += 1000) {
    const chunk = ids.slice(i, i + 1000);
    const pays = await prisma.payment.findMany({ where: { bookingId: { in: chunk } }, select: { bookingId: true, amount: true, method: true, type: true } });
    for (const p of pays) {
      const m = (p.method || '').toLowerCase(), t = (p.type || '').toLowerCase();
      if (t === 'escrow' || m === 'transfermate escrow') continue;
      realPaidBy.set(p.bookingId, (realPaidBy.get(p.bookingId) || 0) + Number(p.amount));
    }
  }

  const settled = bookings.filter(b => {
    const total = Number(b.amountTotal);
    const paid = realPaidBy.get(b.id) || 0;
    return total > 0 && paid >= total - EPS;
  });

  console.log(`→ settled (fully paid, non-escrow) but still ${'PENDING/PARTIAL'}: ${settled.length}`);
  settled.slice(0, 20).forEach(b => {
    const nm = `${b.student?.firstName || ''} ${b.student?.lastName || ''}`.trim();
    console.log(`  bk ${b.id} · student ${b.student?.id} ${nm} · ${b.status} · total ${Number(b.amountTotal).toFixed(2)} · paid ${(realPaidBy.get(b.id) || 0).toFixed(2)}`);
  });
  if (settled.length > 20) console.log(`  … and ${settled.length - 20} more`);
  const students = new Set(settled.map(b => b.student?.id));
  console.log(`(${students.size} distinct students would clear on the Students list)`);

  if (!APPLY) { console.log('\n(dry-run — pass --apply to confirm them)'); await prisma.$disconnect(); return; }

  const r = await prisma.booking.updateMany({ where: { id: { in: settled.map(b => b.id) } }, data: { status: 'CONFIRMED' } });
  console.log(`\n✓ confirmed ${r.count} settled bookings.`);
  await prisma.$disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
