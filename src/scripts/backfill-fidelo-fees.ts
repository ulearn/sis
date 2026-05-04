/**
 * One-shot backfill: pull per-course / per-accommodation fees from Fidelo's
 * invoice line items for existing bookings.
 *
 * Why: the original import-fidelo.ts wrote booking-level totals but never
 * looked at /api/1.1/ts/booking/{id}.data.invoices[].items[], so the per-line
 * pricing was lost. This script re-fetches each FIDELO booking detail, runs
 * it through fidelo-fee-extractor.ts, and updates BookingCourse.fee +
 * BookingAccommodation.fee in place.
 *
 * Usage:
 *   node dist/scripts/backfill-fidelo-fees.js                  # dry-run, all FIDELO bookings missing course fees
 *   node dist/scripts/backfill-fidelo-fees.js --limit=20       # dry-run, first 20 only
 *   node dist/scripts/backfill-fidelo-fees.js --apply          # write to DB
 *   node dist/scripts/backfill-fidelo-fees.js --apply --limit=100  # write 100, useful for pilot
 *   node dist/scripts/backfill-fidelo-fees.js --booking=41914  # one specific booking (debug)
 *   node dist/scripts/backfill-fidelo-fees.js --all-fidelo     # include rows that already have a fee (overwrite)
 */

import dotenv from 'dotenv';
import https from 'https';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { extractFees, InvoiceShape } from './fidelo-fee-extractor';

dotenv.config();

const APPLY = process.argv.includes('--apply');
const ALL = process.argv.includes('--all-fidelo');
const limitArg = process.argv.find(a => a.startsWith('--limit='))?.split('=')[1];
const bookingArg = process.argv.find(a => a.startsWith('--booking='))?.split('=')[1];
const LIMIT = limitArg ? parseInt(limitArg, 10) : null;
const SINGLE_BOOKING = bookingArg ? parseInt(bookingArg, 10) : null;

const API_TOKEN = process.env.FIDELO_API_TOKEN!;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

function fideloGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'ulearn.fidelo.com',
      path: encodeURI(path),
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      timeout: 30000,
    }, (res) => {
      let body = '';
      res.on('data', (c: string) => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Parse error: ' + body.substring(0, 200))); }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('timeout')));
  });
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('=== Fidelo Fee Backfill ===');
  console.log(`Mode: ${APPLY ? 'APPLY (writing to DB)' : 'DRY-RUN (no writes)'}`);

  // Pick which bookings to process
  let bookings: { id: number; fideloBookingId: number | null }[];
  if (SINGLE_BOOKING) {
    bookings = await prisma.booking.findMany({
      where: { fideloBookingId: SINGLE_BOOKING },
      select: { id: true, fideloBookingId: true },
    });
  } else {
    // Default: FIDELO bookings where AT LEAST ONE course has no fee.
    // --all-fidelo overrides to all FIDELO bookings (overwrite mode).
    const where: any = { dataSource: 'FIDELO', fideloBookingId: { not: null } };
    if (!ALL) {
      where.courses = { some: { fee: null } };
    }
    bookings = await prisma.booking.findMany({
      where,
      select: { id: true, fideloBookingId: true },
      orderBy: { id: 'desc' },
      take: LIMIT || undefined,
    });
  }
  console.log(`Targeting ${bookings.length} bookings\n`);

  const stats = {
    fetched: 0,
    fetchErrors: 0,
    noInvoices: 0,
    coursesUpdated: 0,
    accommsUpdated: 0,
    courseTotalEur: 0,
    accomTotalEur: 0,
    regFeeTotalEur: 0,
  };

  for (let i = 0; i < bookings.length; i++) {
    const b = bookings[i];
    if (!b.fideloBookingId) continue;

    try {
      const detail = await fideloGet(`/api/1.1/ts/booking/${b.fideloBookingId}?include_inactive_services=1`);
      stats.fetched++;
      const invoices: InvoiceShape[] = detail?.data?.invoices || [];
      if (!invoices.length) { stats.noInvoices++; continue; }

      // Pull existing courses + accommodations for this booking, in the same order
      // we'll feed to the extractor.
      const courses = await prisma.bookingCourse.findMany({
        where: { bookingId: b.id },
        orderBy: { id: 'asc' },
        select: { id: true, name: true, startDate: true, endDate: true, weeks: true, hoursPerWeek: true, fee: true },
      });
      const accoms = await prisma.bookingAccommodation.findMany({
        where: { bookingId: b.id },
        orderBy: { id: 'asc' },
        select: { id: true, startDate: true, endDate: true, weeks: true, fee: true },
      });

      const fees = extractFees({
        courses: courses.map(c => ({
          name: c.name,
          from: c.startDate ? c.startDate.toISOString().slice(0, 10) : null,
          until: c.endDate ? c.endDate.toISOString().slice(0, 10) : null,
          weeks: c.weeks ?? null,
          hoursPerWeek: c.hoursPerWeek ? Number(c.hoursPerWeek) : null,
        })),
        accommodations: accoms.map(a => ({
          from: a.startDate ? a.startDate.toISOString().slice(0, 10) : null,
          until: a.endDate ? a.endDate.toISOString().slice(0, 10) : null,
          weeks: a.weeks ?? null,
        })),
        invoices,
      });

      // Apply (only when changing). Skip rows that already match.
      for (let ci = 0; ci < courses.length; ci++) {
        const c = courses[ci];
        const newFee = fees.courseFees[ci];
        if (newFee <= 0) continue;
        if (!ALL && c.fee != null && Number(c.fee) > 0) continue; // don't overwrite existing
        if (APPLY) {
          await prisma.bookingCourse.update({ where: { id: c.id }, data: { fee: newFee } });
        }
        stats.coursesUpdated++;
        stats.courseTotalEur += newFee;
      }
      for (let ai = 0; ai < accoms.length; ai++) {
        const a = accoms[ai];
        const newFee = fees.accommodationFees[ai];
        if (newFee <= 0) continue;
        if (!ALL && a.fee != null && Number(a.fee) > 0) continue;
        if (APPLY) {
          await prisma.bookingAccommodation.update({ where: { id: a.id }, data: { fee: newFee } });
        }
        stats.accommsUpdated++;
        stats.accomTotalEur += newFee;
      }
      stats.regFeeTotalEur += fees.registrationFee;

      if (i < 10 || i % 100 === 0) {
        console.log(`[${i+1}/${bookings.length}] booking ${b.fideloBookingId} — courses: ${fees.courseFees.map(n => n.toFixed(2)).join(', ')} | accom: ${fees.accommodationFees.map(n => n.toFixed(2)).join(', ')} | reg: ${fees.registrationFee.toFixed(2)}`);
      } else {
        process.stdout.write(`\r[${i+1}/${bookings.length}] courses upd: ${stats.coursesUpdated}, accoms upd: ${stats.accommsUpdated}, errors: ${stats.fetchErrors}`);
      }

      await sleep(120); // be polite to Fidelo
    } catch (e: any) {
      stats.fetchErrors++;
      console.log(`\n  ERROR booking ${b.fideloBookingId}: ${e.message?.substring(0, 200)}`);
      if (stats.fetchErrors >= 20) {
        console.log('Too many errors, stopping.');
        break;
      }
    }
  }

  console.log('\n\n=== Summary ===');
  console.log(`Bookings fetched: ${stats.fetched}`);
  console.log(`Fetch errors:     ${stats.fetchErrors}`);
  console.log(`No-invoice rows:  ${stats.noInvoices}`);
  console.log(`Courses ${APPLY ? 'updated' : 'would update'}: ${stats.coursesUpdated}  (€${stats.courseTotalEur.toFixed(2)} total)`);
  console.log(`Accoms  ${APPLY ? 'updated' : 'would update'}: ${stats.accommsUpdated}  (€${stats.accomTotalEur.toFixed(2)} total)`);
  console.log(`Registration fees observed: €${stats.regFeeTotalEur.toFixed(2)} (not yet stored — schema addition needed)`);
  if (!APPLY) console.log('\nDRY-RUN — no DB changes. Re-run with --apply to commit.');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
