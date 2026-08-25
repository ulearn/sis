/**
 * One-off escrow reconciliation.
 *
 * Problem: the Fidelo migration brought the 2025 TransferMate-escrow cohort
 * across as booking.status=CONFIRMED + plain 'TransferMate' payments (Neil
 * bulk-switched the custom 'TransferMate Escrow' type back to plain TransferMate
 * mid-2025 when Fidelo never delivered the escrow API). Those students' money is
 * actually still held in TransferMate pending their visa, but in SIS they look
 * settled — so they leak into the unassigned pool, accommodation matching and
 * transport (all of which exclude status='ESCROW').
 *
 * Source of truth: the TM dashboard's held + awaiting buckets
 * (hub fins/scripts/tm/feed.js getFeed), exported to data/escrow-held.json as
 * one row per student { student, country, amount, refs[], bucket }.
 *
 * Match key: name (first + last token) — the TM `ref` does NOT resolve to a
 * HubSpot deal for this historical cohort (Fidelo-era refs have no HubSpot
 * invoice; 2025 refs use a different number format), so name + nationality +
 * amount is the reliable join. Country is a weak tiebreaker only (TM country is
 * payment origin, not nationality).
 *
 * Action: flip each matched student's current/future, non-terminal bookings to
 * status=ESCROW (+ status history). Status alone removes them from every ops
 * list. We do NOT add a shadow payment — their money is already logged as plain
 * TransferMate; a second row would double-count. Re-tagging those existing rows
 * is a separate financial decision, deliberately out of scope here.
 *
 * Usage:
 *   node dist/scripts/reconcile-escrow.js                 # dry-run (default)
 *   node dist/scripts/reconcile-escrow.js --apply         # flip statuses
 *   node dist/scripts/reconcile-escrow.js --held-only     # skip the awaiting bucket
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const APPLY = process.argv.includes('--apply');
const HELD_ONLY = process.argv.includes('--held-only');
const JSON_PATH = path.join(__dirname, '../../data/escrow-held.json');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

type Row = { student: string; country: string | null; amount: number; refs: string[]; bucket: 'held' | 'awaiting' };

// Statuses that are already excluded from ops (don't touch) vs. flippable.
const TERMINAL = new Set(['ESCROW', 'CANCELLED']);

function nameTokens(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return { first: parts[0] || '', last: parts[parts.length - 1] || '' };
}

async function main() {
  const rows: Row[] = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const work = HELD_ONLY ? rows.filter(r => r.bucket === 'held') : rows;
  console.log(`Loaded ${rows.length} students (${work.length} in scope${HELD_ONLY ? ', held-only' : ', held+awaiting'})\n`);

  const stats = { matched: 0, unmatched: 0, ambiguous: 0, arrivedOwed: 0, safeNotPaid: 0, paidReview: 0, nonVbdNoise: 0, awaitingVBD: 0, awaitingNonVBD: 0 };
  const unmatched: string[] = [];

  for (const r of work) {
    const { first, last } = nameTokens(r.student);
    // Require BOTH the first and last token to appear in the SIS full name.
    // Tolerates middle names on either side (e.g. "Fiorella Molina Padilla").
    const candidates = await prisma.student.findMany({
      where: {
        AND: [
          { OR: [{ firstName: { contains: first, mode: 'insensitive' } }, { lastName: { contains: first, mode: 'insensitive' } }] },
          { OR: [{ firstName: { contains: last, mode: 'insensitive' } }, { lastName: { contains: last, mode: 'insensitive' } }] },
        ],
      },
      select: { id: true, firstName: true, lastName: true, nationality: true, visaRequired: true, visaStatus: true },
    });

    if (candidates.length === 0) { stats.unmatched++; unmatched.push(`${r.student} (${r.country}, €${r.amount}, ${r.bucket})`); continue; }

    // Disambiguate multiple students by nationality match when possible.
    let picked = candidates;
    if (candidates.length > 1 && r.country) {
      const natMatch = candidates.filter(c => (c.nationality || '').toLowerCase() === (r.country || '').toLowerCase());
      if (natMatch.length >= 1) picked = natMatch;
    }
    if (picked.length > 1) {
      stats.ambiguous++;
      console.log(`⚠️  AMBIGUOUS ${r.student} (${r.country}) → ${picked.length} SIS students: ${picked.map(c => `#${c.id} ${c.firstName} ${c.lastName}[${c.nationality}]`).join(', ')} — SKIPPED, resolve by hand`);
      continue;
    }
    stats.matched++;
    const s = picked[0];

    // All non-cancelled bookings (so we can SEE already-ESCROW ones too).
    const bookings = await prisma.booking.findMany({
      where: { studentId: s.id, status: { not: 'CANCELLED' as any } },
      select: { id: true, status: true, amountTotal: true, amountPaid: true },
      orderBy: { id: 'asc' },
    });
    // Discriminators that prove the student actually ARRIVED (⇒ visa approved
    // ⇒ if money is still in TM, we are OWED the release — do NOT flip):
    //   attended = sessions marked PRESENT/LATE; assigns = class placements.
    const attended = await prisma.attendance.count({ where: { studentId: s.id, status: { in: ['PRESENT', 'LATE'] as any } } });
    const assigns = await prisma.studentClassAssignment.count({ where: { studentId: s.id } });
    const paid = Math.max(0, ...bookings.map(b => Number(b.amountPaid || 0)), 0);
    const anyEscrowAlready = bookings.some(b => String(b.status) === 'ESCROW');

    // Cohort A = payment not instigated (no money anywhere). Can't be visa-
    // approved, so SIS should not show CONFIRMED — safe to treat as escrow.
    // Cohort B = money received/held. If they also ATTENDED, SIS is probably
    // right and we're owed the TM release; if no attendance, likely still pending.
    // VBD (Visa Before Departure) = visa_required. Escrow ONLY applies to VBD
    // nationals; a non-VBD "awaiting" student (Brazil/Croatia/etc.) would never
    // route through escrow — their TM flag is noise and they're just an unpaid
    // invoice (sales-nudge / legacy cleanup, not escrow data hygiene).
    const vbd = s.visaRequired === true;
    const cohort = (paid <= 0 && r.bucket === 'awaiting') ? 'A-NOTPAID' : 'B-PAID';
    let verdict: string;
    if (attended > 0 || assigns > 0) verdict = `⛔ ARRIVED (att:${attended} cls:${assigns}) — likely APPROVED, DON'T flip; CHASE TM release €${r.amount}`;
    else if (!vbd) verdict = `🟦 non-VBD — escrow doesn't apply; unpaid-invoice / sales-nudge, not a flip`;
    else if (cohort === 'A-NOTPAID') verdict = `✅ VBD, not paid — pre-escrow / sales nudge; shouldn't be CONFIRMED`;
    else verdict = `⚠️  VBD, paid €${paid}, no attendance — review (pending vs unreleased)`;

    const vbdTag = vbd ? 'VBD' : 'non-VBD';
    const bkStr = bookings.map(b => `bk${b.id}:${b.status}(${Number(b.amountPaid||0).toFixed(0)}/${Number(b.amountTotal||0).toFixed(0)})`).join(' ');
    console.log(`[${cohort}] ${r.student} #${s.id} ${s.nationality||'?'}/${vbdTag} visa:${s.visaStatus||'∅'} | TM ${r.bucket} €${r.amount} | ${bkStr}${anyEscrowAlready?' [has-ESCROW]':''}\n        ${verdict}`);

    if (r.bucket === 'awaiting') (vbd ? stats.awaitingVBD++ : stats.awaitingNonVBD++);
    if (attended > 0 || assigns > 0) stats.arrivedOwed++;
    else if (!vbd) stats.nonVbdNoise++;
    else if (cohort === 'A-NOTPAID') stats.safeNotPaid++;
    else stats.paidReview++;
  }

  console.log('\n=== Summary ===');
  console.log(`Matched students:        ${stats.matched}`);
  console.log(`  ⛔ ARRIVED / owed-money: ${stats.arrivedOwed}   (DON'T flip — chase TM release)`);
  console.log(`  🟦 non-VBD noise:        ${stats.nonVbdNoise}   (escrow N/A — unpaid invoice / sales)`);
  console.log(`  ✅ VBD not paid:         ${stats.safeNotPaid}   (pre-escrow / sales nudge)`);
  console.log(`  ⚠️  VBD paid, no attend:  ${stats.paidReview}   (review individually)`);
  console.log(`Awaiting bucket → VBD: ${stats.awaitingVBD} | non-VBD: ${stats.awaitingNonVBD}`);
  console.log(`Ambiguous (skipped):     ${stats.ambiguous}`);
  console.log(`Unmatched:               ${stats.unmatched}`);
  if (unmatched.length) console.log(`\nUnmatched students:\n  - ${unmatched.join('\n  - ')}`);
  console.log('\nREAD-ONLY analysis — no DB changes made.');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
