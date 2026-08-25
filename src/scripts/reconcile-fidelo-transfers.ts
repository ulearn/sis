// Reconcile booking_extras (AIRPORT_PICKUP / AIRPORT_DROPOFF) against
// Fidelo for bookings already in SIS.
//
// The Fidelo importer creates HubSpot-deal-sourced transfers via the
// webhook (deal property → BookingExtra at create time), but the nightly
// Fidelo import doesn't carry transfer rows at all. Antonella has been
// downloading the list from Fidelo manually for taxi booking — this
// closes the loop by populating AIRPORT_PICKUP/DROPOFF extras from the
// Fidelo bookings-LIST endpoint (no extra per-booking API call: the
// importer already pulls this same list nightly).
//
// INSERT-only — never updates or deletes existing extras, so manual
// SIS-side edits (lynk_details, emailSentAt, etc.) are preserved.
//
// Usage:
//   FIDELO_API_TOKEN=... npx ts-node src/scripts/reconcile-fidelo-transfers.ts            # bookings ending >= 30d ago
//   ... npx ts-node src/scripts/reconcile-fidelo-transfers.ts --booking=41867             # single
//   ... npx ts-node src/scripts/reconcile-fidelo-transfers.ts --since-days=60             # widen window
//   ... npx ts-node src/scripts/reconcile-fidelo-transfers.ts --apply                     # default is dry-run
import dotenv from 'dotenv';
import https from 'https';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const API_HOST = 'ulearn.fidelo.com';
const API_TOKEN = process.env.FIDELO_API_TOKEN!;

const APPLY = process.argv.includes('--apply');
const bookingArg = process.argv.find(a => a.startsWith('--booking='))?.split('=')[1];
const sinceDaysArg = process.argv.find(a => a.startsWith('--since-days='))?.split('=')[1];
const BOOKING_ID = bookingArg ? parseInt(bookingArg) : null;
const SINCE_DAYS = sinceDaysArg ? parseInt(sinceDaysArg) : 30;

function fideloGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get({ hostname: API_HOST, path, headers: { Authorization: 'Bearer ' + API_TOKEN } }, (res) => {
      let buf = '';
      res.on('data', (c) => buf += c);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

function parseDt(s: any): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function detailFromFlight(airline: any, flightnum: any): string | null {
  const parts = [airline, flightnum].map(x => (x == null ? '' : String(x).trim())).filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}

(async () => {
  // Pull the Fidelo bookings list. Same query the nightly importer uses —
  // bookings ending in [today - SINCE_DAYS, ∞). Returns ~hundreds typically.
  const sinceDate = new Date(Date.now() - SINCE_DAYS * 86400000).toISOString().slice(0, 10);
  const listData = await fideloGet(`/api/1.0/ts/bookings?filter[all_end_original]=${sinceDate}`);
  const entries = Object.entries(listData.entries || {}) as [string, any][];
  console.log(`Pulled ${entries.length} Fidelo bookings (end_date >= ${sinceDate})${APPLY ? ' (APPLY)' : ' (dry-run)'}`);

  const filtered = BOOKING_ID
    ? entries.filter(([id]) => parseInt(id) === BOOKING_ID)
    : entries;
  if (BOOKING_ID && !filtered.length) {
    console.log(`booking ${BOOKING_ID} not in Fidelo list response — try widening --since-days`);
    await prisma.$disconnect();
    return;
  }

  let totalMissing = 0, totalInserted = 0, scanned = 0, skippedNoBooking = 0;
  for (const [fideloIdStr, le] of filtered) {
    const fideloBookingId = parseInt(fideloIdStr);
    const sisBooking = await prisma.booking.findUnique({
      where: { fideloBookingId },
      include: {
        extras: { where: { active: true, extraType: { in: ['AIRPORT_PICKUP', 'AIRPORT_DROPOFF'] } } },
        student: { select: { firstName: true, lastName: true } },
      },
    });
    if (!sisBooking) { skippedNoBooking++; continue; }
    scanned++;

    // PRIMARY signal: transfer_mode. Fidelo uses 3 = transfer service has
    // actually been booked; 0 = staff just recorded flight info on the
    // booking for reference (no transfer paid for). Earlier rules gated on
    // dates alone (every booking has those) or flight info (set by staff
    // for reference too, e.g. Fabrizio Mauro fb 41901 had "FR6841" but
    // mode 0). Both produced spurious rows. transfer_mode is the canonical
    // discriminator confirmed against Diego's audit 2026-05-19.
    if (le.transfer_mode !== 3) continue;

    const arrival = parseDt(le.transfer_from);
    const departure = parseDt(le.transfer_until);
    // Flight info still required per direction — a mode=3 booking can be
    // pickup-only, dropoff-only, or both. The per-direction flight fields
    // tell us which.
    const pickupDetails  = detailFromFlight(le.transfer_airline, le.transfer_flightnumber);
    const dropoffDetails = detailFromFlight(le.transfer_airline_departure, le.transfer_flightnumber_departure);
    const hasPickup  = !!arrival   && !!pickupDetails;
    const hasDropoff = !!departure && !!dropoffDetails;
    if (!hasPickup && !hasDropoff) continue;

    const existingPickup  = sisBooking.extras.find(e => e.extraType === 'AIRPORT_PICKUP');
    const existingDropoff = sisBooking.extras.find(e => e.extraType === 'AIRPORT_DROPOFF');
    const needsPickup  = hasPickup  && !existingPickup;
    const needsDropoff = hasDropoff && !existingDropoff;
    if (!needsPickup && !needsDropoff) continue;

    totalMissing += (needsPickup ? 1 : 0) + (needsDropoff ? 1 : 0);
    const label = `${sisBooking.student.firstName} ${sisBooking.student.lastName || ''}`.trim();
    console.log(`\n  ${label} (booking ${sisBooking.id}, fidelo ${fideloBookingId}):`);

    if (needsPickup) {
      const details = pickupDetails;
      console.log(`    + AIRPORT_PICKUP  @${arrival!.toISOString()}  ${details || ''}`);
      if (APPLY) {
        try {
          await prisma.bookingExtra.create({
            data: {
              bookingId: sisBooking.id,
              extraType: 'AIRPORT_PICKUP',
              scheduledAt: arrival,
              details,
              active: true,
            },
          });
          totalInserted++;
        } catch (e: any) { console.error(`    FAILED pickup: ${e?.message || e}`); }
      }
    }
    if (needsDropoff) {
      const details = dropoffDetails;
      console.log(`    + AIRPORT_DROPOFF @${departure!.toISOString()}  ${details || ''}`);
      if (APPLY) {
        try {
          await prisma.bookingExtra.create({
            data: {
              bookingId: sisBooking.id,
              extraType: 'AIRPORT_DROPOFF',
              scheduledAt: departure,
              details,
              active: true,
            },
          });
          totalInserted++;
        } catch (e: any) { console.error(`    FAILED dropoff: ${e?.message || e}`); }
      }
    }
  }

  console.log(`\nDone. Fidelo entries scanned: ${filtered.length}. Matching SIS bookings: ${scanned}. Missing transfers: ${totalMissing}. Inserted: ${totalInserted}. Skipped (no SIS booking): ${skippedNoBooking}.`);
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
