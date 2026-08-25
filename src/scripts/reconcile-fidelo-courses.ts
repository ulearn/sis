// Reconcile booking_courses against Fidelo for bookings already in SIS.
//
// The nightly Fidelo importer (import-fidelo.ts) deliberately leaves nested
// courses untouched on the patch-existing pass — that keeps the diff cheap
// but means a course added to an existing booking in Fidelo (typical
// extension flow) never makes it into SIS. This script is the gap-closer:
// pull each existing booking's Fidelo detail and insert any course we don't
// already have.
//
// Scoped INSERTS only — never updates or deletes existing rows, so manual
// SIS-side edits to a course are preserved.
//
// Usage:
//   FIDELO_API_TOKEN=... npx ts-node src/scripts/reconcile-fidelo-courses.ts            # last 30 days of activity
//   ... npx ts-node src/scripts/reconcile-fidelo-courses.ts --booking=41776             # single
//   ... npx ts-node src/scripts/reconcile-fidelo-courses.ts --since-days=60             # widen the window
//   ... npx ts-node src/scripts/reconcile-fidelo-courses.ts --all                       # every Fidelo booking ever (heavy)
//   ... npx ts-node src/scripts/reconcile-fidelo-courses.ts --apply                     # default is dry-run
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
const SCAN_ALL = process.argv.includes('--all');
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

function mapCourseCategory(fideloCategory: string | null): string {
  if (!fideloCategory) return 'OTHER';
  const c = fideloCategory.toLowerCase();
  if (c.includes('morning') && c.includes('plus')) return 'MORNING_PLUS';
  if (c.includes('morning')) return 'MORNING';
  if (c.includes('afternoon') && c.includes('plus')) return 'AFTERNOON_PLUS';
  if (c.includes('afternoon')) return 'AFTERNOON';
  if (c.includes('intensive')) return 'INTENSIVE';
  if (c.includes('private')) return 'PRIVATE';
  return 'OTHER';
}

function getHoursPerWeek(category: string): number | null {
  switch (category) {
    case 'MORNING': return 15;
    case 'MORNING_PLUS': return 20;
    case 'AFTERNOON': return 15;
    case 'AFTERNOON_PLUS': return 20;
    case 'INTENSIVE': return 30;
    default: return null;
  }
}

function parseDate(s: any): Date | null {
  // Match import-fidelo.ts exactly — `new Date('YYYY-MM-DD')` parses as UTC
  // midnight, which is what the @db.Date column stores without TZ shift.
  // Adding 'T00:00:00' (no zone) flips it to local midnight and shaves a day
  // off in BST. See first reconcile run for proof — the 2026-04-20 Fidelo
  // date landed as 2026-04-19 in SIS until this was matched up.
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

(async () => {
  const where: any = { fideloBookingId: { not: null } };
  if (BOOKING_ID) {
    where.fideloBookingId = BOOKING_ID;
  } else if (!SCAN_ALL) {
    // Scope nightly runs to bookings still in play. A course gets added when
    // a student extends, so anything ending in the recent past or still open
    // is a candidate. Older bookings are frozen and don't need re-scanning.
    const since = new Date();
    since.setDate(since.getDate() - SINCE_DAYS);
    since.setHours(0, 0, 0, 0);
    where.serviceEnd = { gte: since };
  }
  const bookings = await prisma.booking.findMany({
    where,
    include: { courses: { select: { fideloCourseId: true } }, student: { select: { firstName: true, lastName: true } } },
    orderBy: { id: 'asc' },
  });
  const scopeLabel = BOOKING_ID ? `booking ${BOOKING_ID}` : SCAN_ALL ? 'ALL bookings' : `bookings active in last ${SINCE_DAYS} days`;
  console.log(`Scanning ${bookings.length} booking(s) — ${scopeLabel}${APPLY ? ' (APPLY)' : ' (dry-run)'}`);

  let totalMissing = 0, totalInserted = 0, errors = 0;
  for (const b of bookings) {
    if (!b.fideloBookingId) continue;
    let detail: any;
    try {
      detail = await fideloGet(`/api/1.1/ts/booking/${b.fideloBookingId}?include_inactive_services=1`);
    } catch (e: any) {
      console.error(`  booking ${b.fideloBookingId}: fetch failed — ${e?.message || e}`);
      errors++;
      continue;
    }
    const courses = detail?.data?.booking?.courses || {};
    const fideloIds = Object.keys(courses).map(k => parseInt(k));
    const sisIds = new Set(b.courses.map(c => c.fideloCourseId).filter((x): x is number => x != null));
    const missing = fideloIds.filter(id => !sisIds.has(id));
    if (!missing.length) continue;

    totalMissing += missing.length;
    const label = `${b.student.firstName} ${b.student.lastName || ''}`.trim();
    console.log(`\n  ${label} (booking ${b.id}, fidelo ${b.fideloBookingId}) — ${missing.length} missing course(s):`);

    for (const cid of missing) {
      const c = (courses as any)[String(cid)];
      const category = mapCourseCategory(c.category);
      const hpw = getHoursPerWeek(category);
      const startDate = parseDate(c.from);
      const endDate = parseDate(c.until);
      if (!startDate || !endDate) {
        console.log(`    - skip ${cid}: missing dates (${c.from} → ${c.until})`);
        continue;
      }
      console.log(`    + ${cid}  ${c.from} → ${c.until}  ${c.name}  (cat=${category}, weeks=${c.weeks || '?'})`);
      if (APPLY) {
        try {
          await prisma.bookingCourse.create({
            data: {
              bookingId: b.id,
              name: c.name || 'Unknown Course',
              category: category as any,
              level: null,
              startDate,
              endDate,
              weeks: c.weeks ? Number(c.weeks) : 0,
              hoursPerWeek: hpw,
              active: c.active === 1,
              fideloCourseId: cid,
            } as any,
          });
          totalInserted++;
        } catch (e: any) {
          console.error(`    FAILED ${cid}: ${e?.message || e}`);
          errors++;
        }
      }
    }
  }

  console.log(`\nDone. Bookings scanned: ${bookings.length}. Missing courses found: ${totalMissing}. Inserted: ${totalInserted}. Errors: ${errors}.`);
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
