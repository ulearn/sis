/**
 * Escrow decision sheet (READ-ONLY → one markdown file).
 *
 * Everyone HELD in TransferMate (data/escrow-held.json), matched to SIS, with a
 * proposed action per Neil's rule (in-escrow ⇒ type 'TransferMate Escrow' +
 * status PENDING/ESCROW):
 *   CHASE   arrived (attendance/placement) ⇒ visa approved ⇒ money should already
 *           be released to us. Get TM to release it. (Includes the ID set.)
 *   DEDUPE  booking has BOTH an escrow row and a plain TransferMate row for ~the
 *           same money ⇒ duplicate; delete the plain one (don't retag).
 *   RETAG   escrow money booked as plain 'TransferMate' (legacy Fidelo type-mix),
 *           student not arrived ⇒ still genuinely in escrow ⇒ retag to
 *           'TransferMate Escrow' + status PENDING/ESCROW.
 *   KEEP    already correctly escrow-tagged.
 * Appendix: the AWAITING bucket (TM flagged escrow but funds NOT received) — these
 *           are the phantom/verify cases, kept separate.
 *
 * Output: .claude/docs/escrow-decision-sheet.md
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const SRC = path.join(__dirname, '../../data/escrow-held.json');
const OUT = path.join(__dirname, '../../.claude/docs/escrow-decision-sheet.md');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

type Row = { student: string; country: string | null; amount: number; refs: string[]; bucket: string };
const isEsc = (t?: string | null, m?: string | null) => t === 'Escrow' || m === 'TransferMate Escrow';
const eur = (n: any) => `€${Number(n || 0).toFixed(0)}`;
const dt = (x: any) => (x ? new Date(x).toISOString().slice(0, 10) : '—');
function tok(f: string) { const p = f.trim().split(/\s+/).filter(Boolean); return { first: p[0] || '', last: p[p.length - 1] || '' }; }

async function classify(r: Row) {
  const { first, last } = tok(r.student);
  const cands = await prisma.student.findMany({
    where: { AND: [
      { OR: [{ firstName: { contains: first, mode: 'insensitive' } }, { lastName: { contains: first, mode: 'insensitive' } }] },
      { OR: [{ firstName: { contains: last, mode: 'insensitive' } }, { lastName: { contains: last, mode: 'insensitive' } }] },
    ] },
    select: { id: true, firstName: true, lastName: true, nationality: true, email: true, fideloCustomerNum: true, hubspotContactId: true },
  });
  if (cands.length !== 1) return { r, action: 'UNMATCHED', cands };
  const s = cands[0];
  const bookings = await prisma.booking.findMany({
    where: { studentId: s.id },
    select: { id: true, status: true, amountTotal: true, amountPaid: true, hubspotDealId: true, fideloBookingId: true,
      payments: { select: { amount: true, type: true, method: true, paidBy: true, paymentDate: true }, orderBy: { id: 'asc' } } },
    orderBy: { id: 'asc' },
  });
  const attended = await prisma.attendance.count({ where: { studentId: s.id, status: { in: ['PRESENT', 'LATE'] as any } } });
  const assigns = await prisma.studentClassAssignment.count({ where: { studentId: s.id } });
  const arrived = attended > 0 || assigns > 0;

  // per-booking signals
  let hasEscRow = false, hasPlainMoney = false, hasDouble = false;
  for (const b of bookings) {
    const esc = b.payments.filter(p => isEsc(p.type, p.method));
    const plain = b.payments.filter(p => !isEsc(p.type, p.method) && Number(p.amount || 0) > 0 && String(b.status) !== 'CANCELLED');
    if (esc.length) hasEscRow = true;
    if (plain.length) hasPlainMoney = true;
    if (esc.length && plain.some(p => esc.some(e => Math.abs(Number(e.amount) - Number(p.amount)) < 1))) hasDouble = true;
  }
  let action: string;
  if (arrived) action = 'CHASE';
  else if (hasDouble) action = 'DEDUPE';
  else if (hasPlainMoney && !hasEscRow) action = 'RETAG';
  else if (hasPlainMoney && hasEscRow) action = 'DEDUPE';
  else action = 'KEEP';
  return { r, action, s, bookings, attended, assigns, arrived };
}

function bookingLines(c: any): string {
  return c.bookings.map((b: any) => {
    const pays = b.payments.length
      ? b.payments.map((p: any) => `${eur(p.amount)} ${p.type || '∅'}/${p.method || '∅'} (${p.paidBy || '∅'}, ${dt(p.paymentDate)})${isEsc(p.type, p.method) ? '' : ' ⚠️'}`).join('<br>')
      : '_none_';
    return `| bk${b.id} | ${b.status} | ${eur(b.amountPaid)}/${eur(b.amountTotal)} | deal ${b.hubspotDealId || '—'} · fid ${b.fideloBookingId || '—'} | ${pays} |`;
  }).join('\n');
}

async function main() {
  const held: Row[] = JSON.parse(fs.readFileSync(SRC, 'utf8')).filter((r: Row) => r.bucket === 'held');
  const awaiting: Row[] = JSON.parse(fs.readFileSync(SRC, 'utf8')).filter((r: Row) => r.bucket === 'awaiting');
  const results: any[] = [];
  for (const r of held) results.push(await classify(r));

  const by = (a: string) => results.filter(x => x.action === a);
  const sum = (a: string) => by(a).reduce((t, x) => t + (x.r.amount || 0), 0);

  const L: string[] = [];
  L.push(`# Escrow decision sheet — money HELD in TransferMate`);
  L.push('');
  L.push(`_Read-only audit. ${held.length} held students. Rule: in-escrow ⇒ type \`TransferMate Escrow\` + status PENDING/ESCROW._`);
  L.push('');
  L.push(`| Action | # | € (TM held) | Meaning |`);
  L.push(`|---|---|---|---|`);
  L.push(`| 🔴 CHASE | ${by('CHASE').length} | ${eur(sum('CHASE'))} | Arrived ⇒ approved ⇒ get TM to release the funds |`);
  L.push(`| 🟠 RETAG | ${by('RETAG').length} | ${eur(sum('RETAG'))} | Escrow money booked as plain TransferMate ⇒ retag + status |`);
  L.push(`| 🟡 DEDUPE | ${by('DEDUPE').length} | ${eur(sum('DEDUPE'))} | Duplicate escrow + plain rows ⇒ delete the plain |`);
  L.push(`| ✅ KEEP | ${by('KEEP').length} | ${eur(sum('KEEP'))} | Already correctly escrow-tagged |`);
  L.push(`| ⚪ UNMATCHED | ${by('UNMATCHED').length} | — | No clean SIS name match ⇒ resolve identity |`);
  L.push('');

  // ── CHASE first, with the full ID set ──
  L.push(`---`);
  L.push(`## 🔴 CHASE — get the funds released`);
  L.push('');
  L.push(`Arrived/attending ⇒ the visa was approved ⇒ the held money should already have been released to us. Chase TransferMate by **TM ref**.`);
  L.push('');
  L.push(`| Name | Email | SIS# | Fidelo# | HubContact | TM ref | € held | Evidence |`);
  L.push(`|---|---|---|---|---|---|---|---|`);
  for (const c of by('CHASE')) {
    L.push(`| ${c.r.student} | ${c.s.email || '—'} | ${c.s.id} | ${c.s.fideloCustomerNum || '—'} | ${c.s.hubspotContactId || '—'} | ${c.r.refs.join(', ')} | ${eur(c.r.amount)} | att ${c.attended} / cls ${c.assigns} |`);
  }
  L.push('');
  L.push(`### CHASE — booking detail`);
  for (const c of by('CHASE')) {
    L.push(`\n**${c.r.student}** (SIS #${c.s.id}, ${c.s.nationality || '?'})`);
    L.push(`| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |`);
    L.push(`|---|---|---|---|---|`);
    L.push(bookingLines(c));
  }

  // ── RETAG ──
  L.push('');
  L.push(`---`);
  L.push(`## 🟠 RETAG — escrow money mistagged as plain TransferMate`);
  L.push(`Not arrived ⇒ still genuinely in escrow; the plain \`TransferMate\` / \`Prior to arrival\` rows should be \`Escrow\`/\`TransferMate Escrow\` and status PENDING/ESCROW.`);
  for (const c of by('RETAG')) {
    L.push(`\n**${c.r.student}** (SIS #${c.s.id}, ${c.s.nationality || '?'}) — TM held ${eur(c.r.amount)} — ref ${c.r.refs.join(', ')}`);
    L.push(`| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |`);
    L.push(`|---|---|---|---|---|`);
    L.push(bookingLines(c));
  }

  // ── DEDUPE ──
  L.push('');
  L.push(`---`);
  L.push(`## 🟡 DEDUPE — duplicate escrow + plain rows`);
  for (const c of by('DEDUPE')) {
    L.push(`\n**${c.r.student}** (SIS #${c.s.id}) — TM held ${eur(c.r.amount)}`);
    L.push(`| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |`);
    L.push(`|---|---|---|---|---|`);
    L.push(bookingLines(c));
  }

  // ── KEEP ──
  L.push('');
  L.push(`---`);
  L.push(`## ✅ KEEP — already correctly escrow-tagged`);
  for (const c of by('KEEP')) L.push(`- ${c.r.student} (SIS #${c.s.id}) — ${eur(c.r.amount)}`);

  // ── UNMATCHED ──
  L.push('');
  L.push(`---`);
  L.push(`## ⚪ UNMATCHED — resolve identity by hand`);
  for (const c of by('UNMATCHED')) L.push(`- ${c.r.student} — TM held ${eur(c.r.amount)} — refs ${c.r.refs.join(', ')} — SIS candidates: ${(c as any).cands.length}`);

  // ── Appendix: AWAITING ──
  L.push('');
  L.push(`---`);
  L.push(`## Appendix — AWAITING bucket (funds NOT received by TM)`);
  L.push(`Kept separate: TM flagged escrow but the money never arrived (mostly agency-committed). These are phantom/verify, not chase or retag yet. ${awaiting.length} students.`);
  L.push('');
  L.push(`| Name | € (awaiting) | TM ref |`);
  L.push(`|---|---|---|`);
  for (const a of awaiting) L.push(`| ${a.student} | ${eur(a.amount)} | ${a.refs.join(', ')} |`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, L.join('\n'));
  console.log(`Wrote ${OUT}`);
  console.log(`CHASE=${by('CHASE').length} RETAG=${by('RETAG').length} DEDUPE=${by('DEDUPE').length} KEEP=${by('KEEP').length} UNMATCHED=${by('UNMATCHED').length}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
