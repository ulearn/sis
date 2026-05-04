/**
 * One-shot backfill: re-create the BookingAccommodation rows that were
 * silently dropped during the original FIDELO import.
 *
 * Why: import-fidelo.ts read `booking.accommodation` (singular). Fidelo
 * returns the field as `accommodations` (plural) in /api/1.1/ts/booking/{id}.
 * The mismatch meant 17,816 historical FIDELO bookings imported with zero
 * accommodation rows (verified: count = 0).
 *
 * The bug is fixed in the import script itself, so future nightly runs are
 * fine. This script back-fills the historical hole.
 *
 * Safety:
 *   - Only operates on dataSource = FIDELO bookings with hubspotInvoiceId
 *     irrelevant — keyed off Booking.fideloBookingId (unique).
 *   - Skips bookings that already have any BookingAccommodation row, so
 *     re-running is idempotent.
 *   - Never touches Booking.studentId — only adds rows attached to the
 *     existing booking. Student linkage cannot drift.
 *
 * Usage:
 *   node dist/scripts/backfill-fidelo-accoms.js                # dry-run, all FIDELO bookings missing accoms
 *   node dist/scripts/backfill-fidelo-accoms.js --limit=50     # dry-run, first 50 only (pilot)
 *   node dist/scripts/backfill-fidelo-accoms.js --apply        # write to DB
 *   node dist/scripts/backfill-fidelo-accoms.js --apply --limit=50
 *   node dist/scripts/backfill-fidelo-accoms.js --booking=41914  # one specific FIDELO booking id (debug)
 */

import dotenv from 'dotenv';
import https from 'https';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { extractFees, InvoiceShape } from './fidelo-fee-extractor';

dotenv.config();

const APPLY = process.argv.includes('--apply');
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

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('=== FIDELO Accommodation Backfill ===');
  console.log(`Mode: ${APPLY ? 'APPLY (writing to DB)' : 'DRY-RUN (no writes)'}`);

  // Pick which bookings to process
  let bookings: { id: number; fideloBookingId: number | null }[];
  if (SINGLE_BOOKING) {
    bookings = await prisma.booking.findMany({
      where: { fideloBookingId: SINGLE_BOOKING },
      select: { id: true, fideloBookingId: true },
    });
  } else {
    // FIDELO bookings that currently have NO accommodation rows.
    bookings = await prisma.booking.findMany({
      where: {
        dataSource: 'FIDELO',
        fideloBookingId: { not: null },
        accommodations: { none: {} },
      },
      select: { id: true, fideloBookingId: true },
      orderBy: { id: 'desc' },
      take: LIMIT || undefined,
    });
  }
  console.log(`Targeting ${bookings.length} bookings (FIDELO + zero accom rows)\n`);

  const stats = {
    fetched: 0,
    fetchErrors: 0,
    bookingsWithNoAccoms: 0,         // booking detail returned but had no accommodations
    bookingsWithAccoms: 0,           // had at least one accom in source
    accomRowsCreated: 0,
    accomFeesApplied: 0,
    accomFeeTotalEur: 0,
  };

  for (let i = 0; i < bookings.length; i++) {
    const b = bookings[i];
    if (!b.fideloBookingId) continue;

    try {
      // Idempotency double-check: even if the where-clause already filtered
      // these out, in concurrent / retry scenarios we must never duplicate.
      const existingCount = await prisma.bookingAccommodation.count({ where: { bookingId: b.id } });
      if (existingCount > 0) continue;

      const detail = await fideloGet(`/api/1.1/ts/booking/${b.fideloBookingId}?include_inactive_services=1`);
      stats.fetched++;
      // Same shape as import-fidelo.ts: detail.data.booking holds courses/accommodations,
      // detail.data.invoices holds the invoice items.
      const bookingNode = (detail as any)?.data?.booking || {};
      const invoicesNode = (detail as any)?.data?.invoices || [];
      const accomSource = bookingNode?.accommodations || bookingNode?.accommodation;

      if (!accomSource || Object.keys(accomSource).length === 0) {
        stats.bookingsWithNoAccoms++;
        if (i < 10 || i % 200 === 0) {
          console.log(`[${i+1}/${bookings.length}] booking ${b.fideloBookingId} — no accommodations in source`);
        }
        await sleep(120);
        continue;
      }
      stats.bookingsWithAccoms++;

      const accomData: any[] = [];
      const accomFeeInputs: { from: string | null; until: string | null; weeks: number | null }[] = [];
      for (const [_accommId, accomm] of Object.entries(accomSource) as [string, any][]) {
        accomData.push({
          accommodationType: accomm.category || null,
          roomType: accomm.roomtype || null,
          board: accomm.board || null,
          startDate: parseDate(accomm.from),
          endDate: parseDate(accomm.until),
          weeks: accomm.weeks || null,
          active: accomm.active === 1,
        });
        accomFeeInputs.push({
          from: accomm.from || null,
          until: accomm.until || null,
          weeks: accomm.weeks ? Number(accomm.weeks) : null,
        });
      }

      // Run the fee extractor on these new accom rows. The fee backfill that's
      // running in parallel only fee-patches accom rows that EXISTED at its
      // findMany() time, so newly-created rows would otherwise be left with
      // fee = NULL. We compute fees here in the same pass to avoid a 3rd round-trip.
      const invoices: InvoiceShape[] = invoicesNode;
      let fees;
      try {
        // Need course inputs too for proportional-split logic to work right.
        // Pull them from the existing BookingCourse rows.
        const courses = await prisma.bookingCourse.findMany({
          where: { bookingId: b.id },
          orderBy: { id: 'asc' },
          select: { name: true, startDate: true, endDate: true, weeks: true, hoursPerWeek: true },
        });
        fees = extractFees({
          courses: courses.map(c => ({
            name: c.name,
            from: c.startDate ? c.startDate.toISOString().slice(0, 10) : null,
            until: c.endDate ? c.endDate.toISOString().slice(0, 10) : null,
            weeks: c.weeks ?? null,
            hoursPerWeek: c.hoursPerWeek ? Number(c.hoursPerWeek) : null,
          })),
          accommodations: accomFeeInputs,
          invoices,
        });
        accomData.forEach((a, idx) => {
          const f = fees!.accommodationFees[idx];
          if (f > 0) {
            a.fee = f;
            stats.accomFeesApplied++;
            stats.accomFeeTotalEur += f;
          }
        });
      } catch (e: any) {
        // Fee extraction is best-effort; never block the row creation
        console.log(`  WARN booking ${b.fideloBookingId}: fee extract failed — ${e.message}`);
      }

      if (APPLY) {
        await prisma.booking.update({
          where: { id: b.id },
          data: { accommodations: { create: accomData } } as any,
        });
      }
      stats.accomRowsCreated += accomData.length;

      if (i < 10 || i % 100 === 0) {
        const summary = accomData.map(a => `${a.accommodationType || '?'}${a.fee ? ` €${a.fee.toFixed(2)}` : ''}`).join(' | ');
        console.log(`[${i+1}/${bookings.length}] booking ${b.fideloBookingId} — ${accomData.length} accom rows: ${summary}`);
      } else {
        process.stdout.write(`\r[${i+1}/${bookings.length}] rows: ${stats.accomRowsCreated}, fees: ${stats.accomFeesApplied}, errors: ${stats.fetchErrors}`);
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
  console.log(`Bookings fetched:           ${stats.fetched}`);
  console.log(`  with accommodations:      ${stats.bookingsWithAccoms}`);
  console.log(`  with no accommodations:   ${stats.bookingsWithNoAccoms}`);
  console.log(`Fetch errors:               ${stats.fetchErrors}`);
  console.log(`Accom rows ${APPLY ? 'created' : 'would create'}: ${stats.accomRowsCreated}`);
  console.log(`Of those, fees populated:   ${stats.accomFeesApplied}  (€${stats.accomFeeTotalEur.toFixed(2)} total)`);
  if (!APPLY) console.log('\nDRY-RUN — no DB changes. Re-run with --apply to commit.');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
