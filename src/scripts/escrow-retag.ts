/**
 * Give the genuinely-in-escrow students the proper TransferMate Escrow shadow
 * treatment (READ-ONLY dry-run by default; --apply to write).
 *
 * Scope: the TM HELD bucket (escrow=Yes & status=Paid ⇒ held in TM awaiting visa,
 * per fins/scripts/tm/report.js), matched to SIS, EXCLUDING anyone with recorded
 * attendance (PRESENT/LATE) — attendance ⇒ arrived ⇒ visa approved ⇒ escrow already
 * RELEASED to our bank (the "Paid people", e.g. Sofiia). Those must NOT be retagged.
 *
 * Per included student, for each non-CANCELLED booking:
 *   - RETAG  plain `TransferMate` payment rows → type='Escrow', method='TransferMate
 *            Escrow' (the shadow type). Skipped (flagged DUP) if an escrow row of the
 *            same amount already exists — don't double the escrow.
 *   - STATUS  booking → ESCROW (+ confirmed=false) — the shadow exclusion that removes
 *            them from pool/accommodation/transport. status history row written.
 *   - VISA    visa_status → 'Pending' if currently null.
 *   - FLAG    non-TransferMate money (Bank Transfer/Stripe/Cash) is left untouched and
 *            flagged for manual review (can't safely assume it's escrow).
 *
 * Usage:  node dist/scripts/escrow-retag.js            # dry-run
 *         node dist/scripts/escrow-retag.js --apply    # write
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const APPLY = process.argv.includes('--apply');
const SRC = path.join(__dirname, '../../data/escrow-held.json');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

type Row = { student: string; country: string | null; amount: number; refs: string[]; bucket: string };
const isEsc = (t?: string | null, m?: string | null) => t === 'Escrow' || m === 'TransferMate Escrow';
const isPlainTM = (t?: string | null, m?: string | null) => m === 'TransferMate' && t !== 'Escrow';
const eur = (n: any) => `€${Number(n || 0).toFixed(0)}`;
function tok(f: string) { const p = f.trim().split(/\s+/).filter(Boolean); return { first: p[0] || '', last: p[p.length - 1] || '' }; }

async function main() {
  const held: Row[] = JSON.parse(fs.readFileSync(SRC, 'utf8')).filter((r: Row) => r.bucket === 'held');
  const stats = { retag: 0, dup: 0, statusFlip: 0, visaSet: 0, otherPay: 0, skippedPaid: 0, included: 0, unmatched: 0 };

  for (const r of held) {
    const { first, last } = tok(r.student);
    const cands = await prisma.student.findMany({
      where: { AND: [
        { OR: [{ firstName: { contains: first, mode: 'insensitive' } }, { lastName: { contains: first, mode: 'insensitive' } }] },
        { OR: [{ firstName: { contains: last, mode: 'insensitive' } }, { lastName: { contains: last, mode: 'insensitive' } }] },
      ] },
      select: { id: true, firstName: true, lastName: true, visaStatus: true },
    });
    if (cands.length !== 1) { stats.unmatched++; console.log(`⚪ ${r.student} — no clean SIS match (${cands.length}) — skip`); continue; }
    const s = cands[0];

    const attended = await prisma.attendance.count({ where: { studentId: s.id, status: { in: ['PRESENT', 'LATE'] as any } } });
    if (attended > 0) { stats.skippedPaid++; console.log(`💰 ${r.student} #${s.id} — attended ${attended} ⇒ released/Paid, NOT escrow — SKIP`); continue; }
    stats.included++;

    const bookings = await prisma.booking.findMany({
      where: { studentId: s.id, status: { not: 'CANCELLED' as any } },
      select: { id: true, status: true, payments: { select: { id: true, amount: true, type: true, method: true } } },
      orderBy: { id: 'asc' },
    });

    const acts: string[] = [];
    for (const b of bookings) {
      const escAmts = b.payments.filter(p => isEsc(p.type, p.method)).map(p => Number(p.amount));
      for (const p of b.payments) {
        if (isPlainTM(p.type, p.method)) {
          const dupEsc = escAmts.some(a => Math.abs(a - Number(p.amount)) < 1);
          if (dupEsc) { stats.dup++; acts.push(`bk${b.id} DEDUPE delete plain ${eur(p.amount)} TransferMate (escrow row already exists)`); if (APPLY) await prisma.payment.delete({ where: { id: p.id } }); }
          else {
            stats.retag++; acts.push(`bk${b.id} RETAG ${eur(p.amount)} TransferMate → TransferMate Escrow`);
            if (APPLY) await prisma.payment.update({ where: { id: p.id }, data: { type: 'Escrow', method: 'TransferMate Escrow' } as any });
          }
        } else if (!isEsc(p.type, p.method) && Number(p.amount) > 0) {
          stats.otherPay++; acts.push(`bk${b.id} FLAG ${eur(p.amount)} ${p.method || '∅'} (non-TransferMate — left as-is)`);
        }
      }
      if (String(b.status) !== 'ESCROW') {
        stats.statusFlip++; acts.push(`bk${b.id} STATUS ${b.status}→ESCROW`);
        if (APPLY) {
          await prisma.booking.update({ where: { id: b.id }, data: { status: 'ESCROW' as any, confirmed: false } as any });
          await prisma.bookingStatusHistory.create({ data: { bookingId: b.id, fromStatus: b.status || 'PENDING', toStatus: 'ESCROW', changedBy: 'escrow-retag' } as any });
        }
      }
    }
    if (!s.visaStatus) { stats.visaSet++; acts.push(`visa_status → Pending`); if (APPLY) await prisma.student.update({ where: { id: s.id }, data: { visaStatus: 'Pending' } as any }); }

    console.log(`${APPLY ? '✔' : '·'} ${r.student} #${s.id}\n    ${acts.join('\n    ')}`);
  }

  console.log(`\n=== Summary (${APPLY ? 'APPLIED' : 'DRY-RUN'}) ===`);
  console.log(`Included (in-escrow):     ${stats.included}`);
  console.log(`Skipped (attended/Paid):  ${stats.skippedPaid}`);
  console.log(`Unmatched:                ${stats.unmatched}`);
  console.log(`Payment rows retagged:    ${stats.retag}`);
  console.log(`Duplicates (manual):      ${stats.dup}`);
  console.log(`Status → ESCROW:          ${stats.statusFlip}`);
  console.log(`visa_status → Pending:    ${stats.visaSet}`);
  console.log(`Non-TransferMate flagged:  ${stats.otherPay}`);
  if (!APPLY) console.log('\nDRY-RUN — no DB changes. Re-run with --apply to write.');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
