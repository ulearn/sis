/**
 * Import historical Fidelo payments directly from the GUI2 Incoming Payments API.
 *
 * Endpoint: /api/1.0/gui2/4e289ca973cc2b424d58ec10197bd160/search
 * Supports a proper date-range filter on the payment date (not cumulative), so we
 * can pull exact windows and iterate backward through time without the payload
 * ballooning like the bookings-list endpoint does.
 *
 * Matching + dedup is identical to import-fidelo-payments.ts:
 *   - Match student via fideloCustomerNum
 *   - If student has 1 booking → attach directly
 *   - If student has >1 booking → pick closest service_start to payment date (±180 days)
 *   - Compound dedup key: (receiptNumber, bookingId)
 *
 * Usage:
 *   node dist/scripts/import-fidelo-payments-api.js --from=2024-01-01 --to=2024-12-31
 *   node dist/scripts/import-fidelo-payments-api.js --from=2024-01-01 --to=2024-06-30 --apply
 *
 * Dates are inclusive on both ends. Default is dry-run.
 */

import dotenv from 'dotenv';
import https from 'https';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const APPLY = process.argv.includes('--apply');
const fromArg = process.argv.find(a => a.startsWith('--from='))?.split('=')[1];
const toArg = process.argv.find(a => a.startsWith('--to='))?.split('=')[1];

if (!fromArg || !toArg) {
  console.error('Usage: node import-fidelo-payments-api.js --from=YYYY-MM-DD --to=YYYY-MM-DD [--apply]');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

const FIDELO_GUI2_HASH = '4e289ca973cc2b424d58ec10197bd160';
const API_TOKEN = process.env.FIDELO_API_TOKEN!;

interface ApiPayment {
  'ip.customerNumber': string;
  receipt_number: string;
  document_number: string | null;
  'ip.firstname': string;
  'ip.lastname': string;
  'ip.fullname': string;
  nationality: string | null;
  'ip.agency': string | null;
  'ip.date': string;
  'ip.comment': string | null;
  amount: number;
  'kpm.name': string | null;
  sender: string | null;
  type_id: number | null;
  'ip.method_id': number | null;
  'ts_i.id': number;
}

function fideloPostGui2(path: string, filters: Record<string, string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams();
    params.set('_token', API_TOKEN);
    for (const [k, v] of Object.entries(filters)) params.set(k, v);
    const body = params.toString();

    const req = https.request({
      hostname: 'ulearn.fidelo.com',
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let d = '';
      res.on('data', (c: string) => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch (e) { reject(new Error('Parse error: ' + d.substring(0, 300))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Convert YYYY-MM-DD → DD/MM/YYYY (Fidelo's GUI2 filter format)
function toFideloDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

async function main() {
  console.log('=== Fidelo Historical Payment Import (API) ===');
  console.log(`Mode: ${APPLY ? 'APPLY (writing to DB)' : 'DRY-RUN'}`);
  console.log(`Date range: ${fromArg} → ${toArg}`);

  const fromFidelo = toFideloDate(fromArg!);
  const toFidelo = toFideloDate(toArg!);
  console.log(`Fetching payments from Fidelo (filter: ${fromFidelo},${toFidelo})...`);

  const startTs = Date.now();
  const result = await fideloPostGui2(`/api/1.0/gui2/${FIDELO_GUI2_HASH}/search`, {
    'filter[date]': `${fromFidelo},${toFidelo}`,
  });
  const entries = Object.values(result.entries || {}) as ApiPayment[];
  console.log(`Fetched ${entries.length} payment records in ${Date.now() - startTs}ms`);

  if (entries.length === 0) {
    console.log('Nothing to import. Done.');
    await prisma.$disconnect(); await pool.end();
    return;
  }

  // Preload all SIS students + their bookings
  const studentNumbers = Array.from(new Set(entries.map(e => String(e['ip.customerNumber'] || '')).filter(Boolean)));
  const students = await prisma.student.findMany({
    where: { fideloCustomerNum: { in: studentNumbers } },
    select: {
      id: true,
      fideloCustomerNum: true,
      firstName: true,
      lastName: true,
      bookings: { select: { id: true, serviceStart: true, serviceEnd: true }, orderBy: { serviceStart: 'desc' } },
    },
  });
  const sisByFid = new Map(students.map(s => [s.fideloCustomerNum!, s]));
  console.log(`Matched ${students.length} SIS students (of ${studentNumbers.length} unique customer numbers)`);

  // Preload existing (receipt, booking) combos. Filter nulls — Prisma can't mix
  // strings and null in an `in` array.
  const receiptList = entries.map(e => e.receipt_number).filter((r): r is string => typeof r === 'string' && r.length > 0);
  const existingRows = receiptList.length > 0
    ? await prisma.payment.findMany({
        where: { receiptNumber: { in: receiptList } },
        select: { receiptNumber: true, bookingId: true },
      })
    : [];
  const existingSet = new Set(existingRows.map(p => `${p.receiptNumber}|${p.bookingId}`));
  console.log(`Existing (receipt,booking) combos already in SIS: ${existingSet.size}\n`);

  const stats = { existing: 0, matchedSingle: 0, matchedClosest: 0, noStudent: 0, noBookingInRange: 0, created: 0, failed: 0 };

  for (const e of entries) {
    const customerNum = String(e['ip.customerNumber'] || '');
    const sis = sisByFid.get(customerNum);
    if (!sis) { stats.noStudent++; continue; }

    let bookingId: number | null = null;
    if (sis.bookings.length === 1) {
      bookingId = sis.bookings[0].id;
      stats.matchedSingle++;
    } else if (sis.bookings.length > 1) {
      const payTs = new Date(e['ip.date']).getTime();
      let best: { id: number, diff: number } | null = null;
      for (const b of sis.bookings) {
        if (!b.serviceStart) continue;
        const diff = Math.abs(new Date(b.serviceStart).getTime() - payTs);
        if (!best || diff < best.diff) best = { id: b.id, diff };
      }
      const MAX = 180 * 86400 * 1000;
      if (best && best.diff <= MAX) {
        bookingId = best.id;
        stats.matchedClosest++;
      } else {
        stats.noBookingInRange++;
        continue;
      }
    } else {
      stats.noBookingInRange++;
      continue;
    }

    if (existingSet.has(`${e.receipt_number}|${bookingId}`)) { stats.existing++; continue; }

    if (!APPLY) { stats.created++; continue; }

    try {
      await prisma.payment.create({
        data: {
          bookingId,
          amount: Number(e.amount || 0),
          method: e['kpm.name'] || null,
          paymentDate: new Date(e['ip.date']),
          type: null, // type_id is a numeric ID; lookup table not imported — keep null for now
          paidBy: e.sender || null,
          transactionId: e.document_number || null,
          comment: e['ip.comment'] || null,
          receiptNumber: e.receipt_number,
          fideloPaymentId: typeof e['ts_i.id'] === 'number' ? e['ts_i.id'] : null,
          dataSource: 'FIDELO',
        } as any,
      });
      stats.created++;
    } catch (err: any) {
      stats.failed++;
      if (stats.failed <= 3) console.log('  ERR:', e.receipt_number, '→', err.message?.substring(0, 120));
    }
  }

  console.log('\n=== Results ===');
  console.log(`Already in SIS (skipped):          ${stats.existing}`);
  console.log(`Matched single-booking:            ${stats.matchedSingle}`);
  console.log(`Matched via date heuristic:        ${stats.matchedClosest}`);
  console.log(`No SIS student (skipped):          ${stats.noStudent}`);
  console.log(`Student has no booking in ±180d:   ${stats.noBookingInRange}`);
  console.log(`${APPLY ? 'Created' : 'Would create'}:                    ${stats.created}`);
  if (stats.failed) console.log(`Failed:                            ${stats.failed}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
