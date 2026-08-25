/**
 * Escrow payment-type audit (READ-ONLY → markdown).
 *
 * For everyone CURRENTLY HELD in TransferMate escrow (data/escrow-held.json,
 * bucket=held only — awaiting deliberately excluded for now), find them in SIS
 * and dump every booking + every payment row so the type mix is visible.
 *
 * Rule of truth (Neil): a student still in escrow should have payment
 * type='Escrow' / method='TransferMate Escrow' AND a held status (PENDING/ESCROW).
 * The Fidelo migration mixed the custom 'TransferMate Escrow' type back into plain
 * 'TransferMate', so undertagged rows are the legacy baggage to spot here.
 *
 * Output: .claude/docs/escrow-held-audit.md
 * Usage:  node dist/scripts/escrow-audit.js   (or via ts-node)
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const SRC = path.join(__dirname, '../../data/escrow-held.json');
const OUT = path.join(__dirname, '../../.claude/docs/escrow-held-audit.md');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

type Row = { student: string; country: string | null; amount: number; refs: string[]; bucket: string };

function tok(full: string) {
  const p = full.trim().split(/\s+/).filter(Boolean);
  return { first: p[0] || '', last: p[p.length - 1] || '' };
}
const isEscrowTag = (t?: string | null, m?: string | null) => t === 'Escrow' || m === 'TransferMate Escrow';
const d = (x: any) => (x ? new Date(x).toISOString().slice(0, 10) : '—');
const eur = (n: any) => `€${Number(n || 0).toFixed(0)}`;

async function main() {
  const held: Row[] = JSON.parse(fs.readFileSync(SRC, 'utf8')).filter((r: Row) => r.bucket === 'held');

  const L: string[] = [];
  L.push(`# Escrow audit — currently HELD in TransferMate`);
  L.push('');
  L.push(`_As of the latest TM feed. Awaiting bucket excluded. ${held.length} held students._`);
  L.push('');
  L.push(`**Rule:** in-escrow ⇒ every escrow payment should be type **\`Escrow\`** / method **\`TransferMate Escrow\`**, and booking status should be **PENDING/ESCROW**.`);
  L.push(`⚠️ = breaks the rule (plain \`TransferMate\`/other carrying escrow money, or wrong status).`);
  L.push('');

  let clean = 0, flagged = 0, nomatch = 0;
  const detail: string[] = [];

  for (const r of held) {
    const { first, last } = tok(r.student);
    const cands = await prisma.student.findMany({
      where: { AND: [
        { OR: [{ firstName: { contains: first, mode: 'insensitive' } }, { lastName: { contains: first, mode: 'insensitive' } }] },
        { OR: [{ firstName: { contains: last, mode: 'insensitive' } }, { lastName: { contains: last, mode: 'insensitive' } }] },
      ] },
      select: { id: true, firstName: true, lastName: true, nationality: true },
    });
    if (cands.length !== 1) {
      nomatch++;
      detail.push(`### ⚪ ${r.student} — TM held ${eur(r.amount)}\n\n_SIS match: ${cands.length === 0 ? 'none found' : cands.length + ' candidates (ambiguous)'} — refs: ${r.refs.join(', ')}_\n`);
      continue;
    }
    const s = cands[0];
    const bookings = await prisma.booking.findMany({
      where: { studentId: s.id },
      select: {
        id: true, status: true, amountTotal: true, amountPaid: true,
        payments: { select: { amount: true, type: true, method: true, paidBy: true, paymentDate: true }, orderBy: { id: 'asc' } },
      },
      orderBy: { id: 'asc' },
    });

    // Per-student flag: any non-cancelled booking that carries money but has NO
    // escrow-tagged row, or a non-held status, is a problem.
    let studentFlag = false;
    const bLines: string[] = [];
    for (const b of bookings) {
      const hasEscrowRow = b.payments.some(p => isEscrowTag(p.type, p.method));
      const hasMoney = b.payments.some(p => Number(p.amount || 0) > 0);
      const statusBad = !['PENDING', 'ESCROW'].includes(String(b.status));
      const tagBad = hasMoney && !hasEscrowRow && String(b.status) !== 'CANCELLED';
      const flag = (tagBad || (statusBad && String(b.status) !== 'CANCELLED' && hasMoney)) ? ' ⚠️' : '';
      if (flag) studentFlag = true;

      const payStr = b.payments.length
        ? b.payments.map(p => `${eur(p.amount)} · ${p.type || '∅'} / ${p.method || '∅'} · ${p.paidBy || '∅'} · ${d(p.paymentDate)}${isEscrowTag(p.type, p.method) ? '' : ' ⚠️'}`).join('<br>')
        : '_no payments_';
      bLines.push(`| bk${b.id} | ${b.status}${statusBad && String(b.status) !== 'CANCELLED' ? ' ⚠️' : ''} | ${eur(b.amountPaid)} / ${eur(b.amountTotal)} | ${payStr} |${flag}`);
    }
    studentFlag ? flagged++ : clean++;

    detail.push(
      `### ${studentFlag ? '⚠️' : '✅'} ${r.student} — SIS #${s.id} (${s.nationality || '?'}) — TM held ${eur(r.amount)}\n\n` +
      `| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |\n|---|---|---|---|---|\n` +
      bLines.join('\n') + '\n'
    );
  }

  L.push(`## Summary`);
  L.push('');
  L.push(`- ⚠️ **${flagged}** need fixing (escrow money not tagged \`TransferMate Escrow\`, or wrong status)`);
  L.push(`- ✅ ${clean} already clean`);
  L.push(`- ⚪ ${nomatch} could not be matched in SIS by name (resolve by hand)`);
  L.push('');
  L.push(`---`);
  L.push('');
  L.push(...detail);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, L.join('\n'));
  console.log(`Wrote ${OUT}`);
  console.log(`held=${held.length}  flagged=${flagged}  clean=${clean}  nomatch=${nomatch}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
