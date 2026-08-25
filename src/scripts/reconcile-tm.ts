/**
 * TransferMate ↔ SIS payment reconciliation (READ-ONLY).
 *
 * The disease behind the unassigned-pool leak: SIS-recorded payments don't agree
 * with what TransferMate actually holds/received, nor with Xero. This report
 * matches every TM feed transaction (2025+ export + live API, from
 * data/tm-feed-full.json) against SIS payments and classifies each student.
 *
 * Scope: the TM feed window is 1-Jan-2025 onward (the live API can't look back;
 * the export covers all problematic bookings). SIS has ~395 TransferMate-payment
 * students but only ~116 fall in the feed window — the rest are pre-2025 settled
 * and out of scope (can't reconcile without TM data).
 *
 * TM state per tx (derived hub-side): HELD (escrow, funds received, sitting in
 * TM), AWAITING (escrow flagged, funds NOT received), SETTLED (normal/released
 * payment), REFUNDED.
 *
 * Classification per student:
 *   RELEASED_OWED   arrived (attendance/placement) AND money still HELD in TM
 *                   → visa approved, release never actioned → WE ARE OWED IT.
 *   SIS_UNDERTAGGED TM HELD but SIS booked it as plain TransferMate/settled (not
 *                   escrow-tagged) → leaks into ops lists AND looks like settled
 *                   cash we don't actually have. (Dashmaa/Temuulen pattern.)
 *   HELD_OK         TM HELD ≈ SIS escrow-tagged, not arrived → genuinely in
 *                   escrow (visa pending). Correct; ops should exclude.
 *   PHANTOM_ESCROW  SIS booked a TransferMate Escrow payment but TM says AWAITING
 *                   (never received) → SIS recorded money that isn't there.
 *   SETTLED_OK      TM SETTLED, nothing outstanding → money came through, fine.
 *   REVIEW          amounts/states don't fit a clean bucket.
 *   TM_ONLY         in the TM feed but no SIS student matched by name.
 *
 * Usage:  node dist/scripts/reconcile-tm.js            (or via ts-node)
 *         node dist/scripts/reconcile-tm.js --escrow   (hide SETTLED_OK rows)
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const ESCROW_ONLY = process.argv.includes('--escrow');
const FEED_PATH = path.join(__dirname, '../../data/tm-feed-full.json');
const TOL = 0.10; // 10% amount tolerance (FX + TM fees)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

type Tx = { id: string; student: string; ref: string; amount: number; escrow: boolean; status: string; state: string; paidDate: string | null };

function tok(full: string) {
  const p = full.trim().split(/\s+/).filter(Boolean);
  return { first: p[0] || '', last: p[p.length - 1] || '' };
}
const near = (a: number, b: number) => b > 0 && Math.abs(a - b) <= b * TOL;

async function main() {
  const feed: Tx[] = JSON.parse(fs.readFileSync(FEED_PATH, 'utf8'));

  // Group TM transactions by normalised student name.
  const byStudent = new Map<string, { name: string; held: number; awaiting: number; settled: number; refunded: number; states: Set<string> }>();
  for (const t of feed) {
    const k = t.student.toLowerCase();
    if (!byStudent.has(k)) byStudent.set(k, { name: t.student, held: 0, awaiting: 0, settled: 0, refunded: 0, states: new Set() });
    const g = byStudent.get(k)!;
    g.states.add(t.state);
    if (t.state === 'HELD') g.held += t.amount;
    else if (t.state === 'AWAITING') g.awaiting += t.amount;
    else if (t.state === 'SETTLED') g.settled += t.amount;
    else if (t.state === 'REFUNDED') g.refunded += t.amount;
  }

  const out: { cls: string; line: string; owed: number }[] = [];
  const tally: Record<string, { n: number; eur: number }> = {};
  const add = (cls: string, line: string, owed = 0) => { out.push({ cls, line, owed }); (tally[cls] ??= { n: 0, eur: 0 }).n++; tally[cls].eur += owed; };

  for (const g of byStudent.values()) {
    const { first, last } = tok(g.name);
    const cands = await prisma.student.findMany({
      where: { AND: [
        { OR: [{ firstName: { contains: first, mode: 'insensitive' } }, { lastName: { contains: first, mode: 'insensitive' } }] },
        { OR: [{ firstName: { contains: last, mode: 'insensitive' } }, { lastName: { contains: last, mode: 'insensitive' } }] },
      ] },
      select: { id: true, firstName: true, lastName: true, nationality: true },
    });
    if (cands.length !== 1) {
      if (g.held > 0 || g.awaiting > 0) add('TM_ONLY', `${g.name} — TM held €${g.held.toFixed(0)} awaiting €${g.awaiting.toFixed(0)} | SIS match: ${cands.length === 0 ? 'none' : cands.length + ' (ambiguous)'}`);
      continue;
    }
    const s = cands[0];

    const pays = await prisma.payment.findMany({
      where: { booking: { studentId: s.id }, OR: [{ method: { startsWith: 'TransferMate' } }, { type: 'Escrow' }] },
      select: { amount: true, method: true, type: true },
    });
    const escrowTagged = pays.filter(p => p.type === 'Escrow' || p.method === 'TransferMate Escrow').reduce((a, p) => a + Number(p.amount || 0), 0);
    const plainTm = pays.filter(p => p.method === 'TransferMate' && p.type !== 'Escrow').reduce((a, p) => a + Number(p.amount || 0), 0);

    const attended = await prisma.attendance.count({ where: { studentId: s.id, status: { in: ['PRESENT', 'LATE'] as any } } });
    const assigns = await prisma.studentClassAssignment.count({ where: { studentId: s.id } });
    const arrived = attended > 0 || assigns > 0;

    // CORRECTED TM semantics: status=Paid ⇒ money RECEIVED in ULearn bank
    // (escrow already released). status=Pending ⇒ still in escrow, NOT yet ours.
    const tmReceived = g.held + g.settled;   // escrow-released + normal, both Paid
    const tmEscrow = g.awaiting;             // escrow, still Pending (not paid out)

    const tmStr = `TM[recv€${tmReceived.toFixed(0)} escrow€${tmEscrow.toFixed(0)}]`;
    const sisStr = `SIS[escTag€${escrowTagged.toFixed(0)} plainTM€${plainTm.toFixed(0)}]`;
    const who = `${g.name} #${s.id}${arrived ? ` ✈(${attended}/${assigns})` : ''}`;
    const line = `${who} | ${tmStr} ${sisStr}`;

    // The two TRUE cross-mismatches:
    if (tmEscrow > 0 && escrowTagged < tmEscrow * (1 - TOL)) add('LEAK_SIS_PAID', line, tmEscrow);            // (b) still in escrow but SIS shows paid → pool leak + cash overstated
    else if (tmReceived > 0 && escrowTagged > 0 && plainTm < tmReceived * (1 - TOL)) add('HIDDEN_SIS_ESCROW', line, tmReceived); // (a) received but SIS tagged escrow → wrongly excluded
    else if (tmEscrow > 0) add('OK_ESCROW', line);          // TM escrow + SIS escrow-tagged
    else if (tmReceived > 0) add('OK_RECEIVED', line);      // TM paid + SIS shows paid
    else add('REVIEW', line);
  }

  const order = ['LEAK_SIS_PAID', 'HIDDEN_SIS_ESCROW', 'REVIEW', 'TM_ONLY', 'OK_ESCROW', 'OK_RECEIVED'];
  for (const cls of order) {
    const rows = out.filter(r => r.cls === cls);
    if (!rows.length) continue;
    if (ESCROW_ONLY && (cls === 'OK_RECEIVED' || cls === 'OK_ESCROW')) continue;
    console.log(`\n──── ${cls} (${rows.length}) ────`);
    for (const r of rows) console.log(`  ${r.line}`);
  }

  console.log('\n=== Summary ===');
  for (const cls of order) if (tally[cls]) console.log(`  ${cls.padEnd(16)} ${String(tally[cls].n).padStart(3)}   ${tally[cls].eur ? '€' + Math.round(tally[cls].eur).toLocaleString() : ''}`);
  console.log('\nLegend: H=held(in TM) A=awaiting(not received) S=settled | esc=SIS escrow-tagged plainTM=SIS plain TransferMate | ✈=arrived(att/cls)');
  console.log('READ-ONLY — no DB changes.');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
