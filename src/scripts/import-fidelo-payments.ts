/**
 * One-off: import historical Fidelo payment records from a TSV dump of the
 * hub_payroll.payment_detail MySQL table.
 *
 * Source: hub.ulearnschool.com MySQL → exported via SSH to /tmp/fidelo_payments.tsv
 * Columns (tab-separated):
 *   receipt_number, student_id, surname, first_name, amount, method, date,
 *   type, invoice_number, paid_by, note
 *
 * Matching:
 *   1. Look up SIS student by fideloCustomerNum == student_id
 *   2. If student has 1 booking → attach
 *   3. If student has >1 booking → pick the one whose service_start is closest
 *      to the payment date (within ±180 days); else log unmatched
 *   4. If no student match → log and skip
 *
 * Idempotent: keyed on receiptNumber unique constraint. Re-running is safe.
 * Pass --apply to actually write; default is dry-run.
 */

import dotenv from 'dotenv';
import fs from 'fs';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const TSV_PATH = process.argv.find(a => a.startsWith('--file='))?.split('=')[1] || '/tmp/fidelo_payments.tsv';
const APPLY = process.argv.includes('--apply');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

interface Row {
  receipt: string;
  studentId: string;
  surname: string;
  firstName: string;
  amount: number;
  method: string | null;
  paymentDate: Date;
  type: string | null;
  invoiceNum: string | null;
  paidBy: string | null;
  note: string | null;
}

function parseAmount(s: string): number {
  if (!s || s === 'NULL') return 0;
  const cleaned = s.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseRows(): Row[] {
  const raw = fs.readFileSync(TSV_PATH, 'utf8');
  // MySQL adds a deprecation warning as the first line; skip any line starting with "mysql:"
  const lines = raw.split('\n').filter(l => l.trim() && !l.startsWith('mysql:'));
  const rows: Row[] = [];
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 7) continue;
    const [receipt, studentId, surname, firstName, amount, method, date, type, invoiceNum, paidBy, note] = parts;
    if (!receipt || receipt === 'NULL' || receipt === 'receipt_number') continue;
    if (!date || date === 'NULL') continue;
    rows.push({
      receipt: receipt.trim(),
      studentId: (studentId || '').trim(),
      surname: surname || '',
      firstName: firstName || '',
      amount: parseAmount(amount),
      method: method && method !== 'NULL' ? method : null,
      paymentDate: new Date(date),
      type: type && type !== 'NULL' ? type : null,
      invoiceNum: invoiceNum && invoiceNum !== 'NULL' ? invoiceNum : null,
      paidBy: paidBy && paidBy !== 'NULL' ? paidBy : null,
      note: note && note !== 'NULL' ? note : null,
    });
  }
  return rows;
}

async function main() {
  console.log('=== Fidelo Historical Payment Import ===');
  console.log('Mode:', APPLY ? 'APPLY (writing to DB)' : 'DRY-RUN');
  console.log('Source:', TSV_PATH);

  const rows = parseRows();
  console.log(`Parsed ${rows.length} payment rows\n`);

  // Load all SIS students + their bookings that might match
  const studentIds = Array.from(new Set(rows.map(r => r.studentId).filter(Boolean)));
  const students = await prisma.student.findMany({
    where: { fideloCustomerNum: { in: studentIds } },
    select: {
      id: true,
      fideloCustomerNum: true,
      firstName: true,
      lastName: true,
      bookings: { select: { id: true, serviceStart: true, serviceEnd: true }, orderBy: { serviceStart: 'desc' } },
    },
  });
  const sisByFid = new Map(students.map(s => [s.fideloCustomerNum!, s]));
  console.log(`Matched ${students.length} SIS students`);

  // Count existing (receipt, booking) combos to know what's already imported.
  // Dedup is compound because one bulk-transfer receipt can cover many students/bookings.
  const existing = await prisma.payment.findMany({
    where: { receiptNumber: { in: rows.map(r => r.receipt) } as any },
    select: { receiptNumber: true, bookingId: true },
  });
  const existingSet = new Set(existing.map(p => `${p.receiptNumber}|${p.bookingId}`));
  console.log(`Already in SIS: ${existingSet.size}\n`);

  const stats = {
    existing: 0,
    matchedSingleBooking: 0,
    matchedClosestDate: 0,
    noStudent: 0,
    noBookingInRange: 0,
    upserted: 0,
    failed: 0,
  };
  const unmatchedReasons: Record<string, number> = {};

  for (const row of rows) {
    const sis = sisByFid.get(row.studentId);
    if (!sis) {
      stats.noStudent++;
      continue;
    }
    let bookingId: number | null = null;

    if (sis.bookings.length === 1) {
      bookingId = sis.bookings[0].id;
      stats.matchedSingleBooking++;
    } else if (sis.bookings.length > 1) {
      // Pick the booking whose service_start is closest to the payment date,
      // within ±180 days
      const payTs = row.paymentDate.getTime();
      let best: { id: number, diff: number } | null = null;
      for (const b of sis.bookings) {
        if (!b.serviceStart) continue;
        const diff = Math.abs(new Date(b.serviceStart).getTime() - payTs);
        if (!best || diff < best.diff) best = { id: b.id, diff };
      }
      const MAX = 180 * 86400 * 1000;
      if (best && best.diff <= MAX) {
        bookingId = best.id;
        stats.matchedClosestDate++;
      } else {
        stats.noBookingInRange++;
        continue;
      }
    } else {
      // Student exists but has 0 bookings — shouldn't happen given our earlier check
      stats.noBookingInRange++;
      continue;
    }

    // Compound dedup check: skip if this (receipt, bookingId) combo already exists
    if (existingSet.has(`${row.receipt}|${bookingId}`)) {
      stats.existing++;
      continue;
    }

    if (!APPLY) {
      stats.upserted++;
      continue;
    }

    try {
      await prisma.payment.create({
        data: {
          bookingId: bookingId,
          amount: row.amount,
          method: row.method,
          paymentDate: row.paymentDate,
          type: row.type,
          paidBy: row.paidBy,
          transactionId: row.invoiceNum, // Fidelo invoice reference
          comment: row.note,
          receiptNumber: row.receipt,
          dataSource: 'FIDELO',
        } as any,
      });
      stats.upserted++;
    } catch (e: any) {
      stats.failed++;
      const reason = e.code === 'P2002' ? 'duplicate_receipt' : (e.message?.substring(0, 50) || 'unknown');
      unmatchedReasons[reason] = (unmatchedReasons[reason] || 0) + 1;
    }
  }

  console.log('\n=== Results ===');
  console.log(`Already in SIS (skipped):          ${stats.existing}`);
  console.log(`Matched single-booking:            ${stats.matchedSingleBooking}`);
  console.log(`Matched via date heuristic:        ${stats.matchedClosestDate}`);
  console.log(`No SIS student (will retry later): ${stats.noStudent}`);
  console.log(`Student exists but no booking in ±180d: ${stats.noBookingInRange}`);
  console.log(`${APPLY ? 'Created' : 'Would create'}:                  ${stats.upserted}`);
  if (stats.failed) console.log(`Failed:                            ${stats.failed}`);
  if (Object.keys(unmatchedReasons).length) {
    console.log('Failure reasons:');
    for (const [k, v] of Object.entries(unmatchedReasons)) console.log(`  ${k}: ${v}`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
