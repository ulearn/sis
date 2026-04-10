import dotenv from 'dotenv';
import https from 'https';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const API_HOST = 'ulearn.fidelo.com';
const API_TOKEN = process.env.FIDELO_API_TOKEN!;

// Date filter — bookings ending in the given range are fetched.
//   --from=YYYY-MM-DD  (required): earliest end date (inclusive)
//   --to=YYYY-MM-DD    (optional): latest end date (inclusive). If given, only
//                      bookings ending in the FROM..TO window are returned.
//                      If omitted, behaviour is the original "≥ FROM" cumulative.
// Default FROM: 2026-01-01 (nightly cron). Override via FIDELO_FROM_DATE env var.
const fromArg = process.argv.find(a => a.startsWith('--from='))?.split('=')[1];
const toArg = process.argv.find(a => a.startsWith('--to='))?.split('=')[1];
const FROM_DATE = fromArg || process.env.FIDELO_FROM_DATE || '2026-01-01';
const TO_DATE = toArg || null;

// Territory filter — skip bookings whose student is from an unsupported country.
// OFF by default (nightly cron doesn't need it — staff gatekeep unsupported nationalities
// at the Fidelo entry point). Opt in with --filter-territory for historical backfills,
// where stale data may contain previously-accepted unsupported nationalities.
// Override the map file with --territory-map=filename.json (default: TerritoryMap.json).
const FILTER_TERRITORY = process.argv.includes('--filter-territory');
const mapArg = process.argv.find(a => a.startsWith('--territory-map='))?.split('=')[1];
const TERRITORY_MAP_FILE = mapArg || 'TerritoryMap.json';
let unsupportedCountries = new Set<string>();
if (FILTER_TERRITORY) {
  try {
    const mapPath = path.resolve(__dirname, '../../.claude/docs/', TERRITORY_MAP_FILE);
    const map = JSON.parse(fs.readFileSync(mapPath, 'utf-8')) as Record<string, string>;
    for (const [country, cat] of Object.entries(map)) {
      if (cat === 'unsupported_territory') unsupportedCountries.add(country.toLowerCase());
    }
    console.log(`[territory] Filter ACTIVE — loaded ${TERRITORY_MAP_FILE} with ${unsupportedCountries.size} unsupported countries`);
  } catch (e) {
    console.warn(`[territory] Could not load ${TERRITORY_MAP_FILE} — filter disabled`);
  }
}

// Reusable region-name resolver (ISO code → English country name)
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function isUnsupportedTerritory(country: string | null | undefined): boolean {
  if (!FILTER_TERRITORY) return false;
  if (!country) return false; // don't skip if unknown — we'd rather import and flag later

  const s = country.trim();
  // Direct match on full name (e.g. "India")
  if (unsupportedCountries.has(s.toLowerCase())) return true;
  // ISO-2 code fallback (e.g. "IN" → "India")
  if (s.length === 2) {
    try {
      const name = regionNames.of(s.toUpperCase());
      if (name && unsupportedCountries.has(name.toLowerCase())) return true;
    } catch { /* not a valid ISO code — ignore */ }
  }
  return false;
}

function fideloGet(path: string): Promise<any> {
  // Streaming JSON parse — avoids the Node string length limit (~512MB) that
  // blows up JSON.parse on large Fidelo bookings-list responses. stream-json
  // assembles the full JSON tree incrementally from HTTPS chunks using the
  // assembler pattern (token stream → object).
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      path: encodeURI(path),
      headers: { 'Authorization': `Bearer ${API_TOKEN}` },
    };
    https.get(options, (res) => {
      const { asStream: parserStream } = require('stream-json/parser.js');
      const { assembler: makeAssembler } = require('stream-json/assembler.js');
      const p = res.pipe(parserStream());
      const asm = makeAssembler();
      p.on('data', (token: any) => asm[token.name] && asm[token.name](token.value));
      p.on('end', () => resolve(asm.current));
      p.on('error', reject);
    }).on('error', reject);
  });
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function stripHtml(s: string | null): string | null {
  if (!s) return null;
  return s.replace(/<[^>]*>/g, '').trim() || null;
}

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function mapStatus(fideloStatus: string, confirmed: boolean): string {
  if (fideloStatus === 'cancelled') return 'CANCELLED';
  // Valid BookingStatus values: PENDING, PARTIAL, CONFIRMED, ESCROW, CANCELLED
  // Fidelo's "confirmed" flag = booking is signed-off and active → CONFIRMED.
  // Unconfirmed bookings are still in enquiry → PENDING.
  if (confirmed) return 'CONFIRMED';
  return 'PENDING';
}

async function main() {
  console.log('=== Fidelo Import ===');
  const dateFilter = TO_DATE ? `${FROM_DATE},${TO_DATE}` : FROM_DATE;
  console.log(`Date range: ${TO_DATE ? `${FROM_DATE} → ${TO_DATE} (narrow window)` : `≥ ${FROM_DATE} (cumulative)`}`);
  console.log(`Territory filter: ${FILTER_TERRITORY ? `ACTIVE (skipping ${unsupportedCountries.size} unsupported countries from ${TERRITORY_MAP_FILE})` : 'OFF — pass --filter-territory to enable'}`);
  console.log('Fetching bookings list from Fidelo API...');

  // Phase 1: Fetch bookings list
  const listData = await fideloGet(`/api/1.0/ts/bookings?filter[all_end_original]=${dateFilter}`);
  const entries = Object.entries(listData.entries || {});
  console.log(`Found ${entries.length} bookings`);

  const stats = { students: 0, studentsUpdated: 0, bookings: 0, bookingsSkipped: 0, territorySkipped: 0, courses: 0, accommodations: 0, holidays: 0, agencies: 0, errors: 0 };

  for (let i = 0; i < entries.length; i++) {
    const [bookingIdStr, listEntry] = entries[i] as [string, any];
    const fideloBookingId = parseInt(bookingIdStr);

    // Skip if already imported
    const existing = await prisma.booking.findUnique({ where: { fideloBookingId } });
    if (existing) { stats.bookingsSkipped++; continue; }

    // Early territory filter — skip unsupported nationalities BEFORE the expensive detail fetch.
    // Fidelo list entries sometimes carry the full name, sometimes only the ISO code.
    // Check both — isUnsupportedTerritory handles either format.
    const le = listEntry as any;
    const listNationality = le.customer_nationality || le.customer_nationality_iso || le.nationality || null;
    if (isUnsupportedTerritory(listNationality)) {
      stats.territorySkipped++;
      continue;
    }

    try {
      // Fetch full booking detail
      const detail = await fideloGet(`/api/1.1/ts/booking/${fideloBookingId}`);
      const student = detail.data?.student;
      const booking = detail.data?.booking;
      if (!student || !booking) { console.log(`  [${i+1}] No student/booking data for ${fideloBookingId}, skipping`); stats.errors++; continue; }

      // Second territory check — student detail may have more reliable nationality than list entry.
      const detailNationality = student.nationality || student.country || null;
      if (isUnsupportedTerritory(detailNationality)) {
        stats.territorySkipped++;
        continue;
      }

      // Phase 2: Match/create agency
      let agencyId: number | null = null;
      if (le.agency_id) {
        const fideloAgencyId = parseInt(le.agency_id);
        // Try to find by fideloAgencyId first
        let agency = await prisma.agency.findFirst({ where: { fideloAgencyId } });
        if (!agency && le.agency_name) {
          // Try by name
          const name = stripHtml(le.agency_name);
          if (name) {
            agency = await prisma.agency.findFirst({ where: { name } });
            if (agency) {
              // Update with fideloAgencyId
              await prisma.agency.update({ where: { id: agency.id }, data: { fideloAgencyId } as any });
            } else {
              // Create
              agency = await prisma.agency.create({ data: { name, fideloAgencyId } as any });
              stats.agencies++;
            }
          }
        }
        agencyId = agency?.id || null;
      }

      // Phase 3: Upsert student
      const fideloContactId = parseInt(le.contact_id);
      let dbStudent = await prisma.student.findFirst({ where: { fideloContactId } });

      // Normalise email — Fidelo returns an array for family bookings, we want the first one
      const rawEmail = student.email || le.email || '';
      const normEmail = Array.isArray(rawEmail) ? (rawEmail[0] || '') : String(rawEmail);

      const studentData: any = {
        firstName: student.firstname || le.customer_firstname || 'Unknown',
        lastName: student.surname || le.customer_lastname || 'Unknown',
        email: normEmail,
        gender: le.customer_gender === 'male' ? 1 : le.customer_gender === 'female' ? 2 : null,
        birthday: parseDate(le.customer_birthday),
        nationality: (le.customer_nationality_iso || '').substring(0, 2) || null,
        language: le.customer_language_en || null,
        phone: (stripHtml(le.customer_tel) || '').substring(0, 50) || null,
        phoneMobile: (stripHtml(le.customer_mobile) || '').substring(0, 50) || null,
        address: stripHtml(le.customer_address) || null,
        city: stripHtml(le.customer_city) || null,
        zip: stripHtml(le.customer_zip) || null,
        countryIso: (le.customer_country_original || '').substring(0, 2) || null,
        fideloContactId,
        fideloCustomerNum: le.customer_number?.toString() || null,
      };

      // Auto-set student type from DOB
      if (studentData.birthday) {
        const age = Math.floor((Date.now() - new Date(studentData.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        studentData.studentType = age < 16 ? 'JUNIOR' : 'ADULT';
      }

      if (dbStudent) {
        // Update with any new data
        delete studentData.fideloContactId; // can't update unique field
        delete studentData.fideloCustomerNum;
        await prisma.student.update({ where: { id: dbStudent.id }, data: studentData as any });
        stats.studentsUpdated++;
      } else {
        // Check by email as fallback
        if (studentData.email) {
          dbStudent = await prisma.student.findFirst({ where: { email: studentData.email } });
        }
        if (dbStudent) {
          await prisma.student.update({ where: { id: dbStudent.id }, data: { ...studentData, fideloContactId, fideloCustomerNum: le.customer_number?.toString() } as any });
          stats.studentsUpdated++;
        } else {
          dbStudent = await prisma.student.create({ data: studentData as any });
          stats.students++;
        }
      }

      // Phase 4: Map courses
      const coursesData: any[] = [];
      if (booking.courses) {
        for (const [courseId, course] of Object.entries(booking.courses) as [string, any][]) {
          const category = mapCourseCategory(course.category);
          coursesData.push({
            name: course.name || 'Unknown Course',
            category,
            level: null, // level is on assignments, not course
            startDate: parseDate(course.from),
            endDate: parseDate(course.until),
            weeks: course.weeks || null,
            hoursPerWeek: getHoursPerWeek(category),
            active: course.active === 1,
            fideloCourseId: parseInt(courseId),
          });
          stats.courses++;
        }
      }

      // Map accommodation
      const accommData: any[] = [];
      if (booking.accommodation) {
        for (const [accommId, accomm] of Object.entries(booking.accommodation || {}) as [string, any][]) {
          accommData.push({
            accommodationType: accomm.category || null,
            roomType: accomm.roomtype || null,
            board: accomm.board || null,
            startDate: parseDate(accomm.from),
            endDate: parseDate(accomm.until),
            weeks: accomm.weeks || null,
            active: accomm.active === 1,
          });
          stats.accommodations++;
        }
      }

      // Map holidays
      const holidaysData: any[] = [];
      if (booking.holidays) {
        for (const [, holiday] of Object.entries(booking.holidays || {}) as [string, any][]) {
          holidaysData.push({
            startDate: parseDate(holiday.from),
            endDate: parseDate(holiday.until),
            weeks: holiday.weeks || null,
            type: holiday.type || null,
          });
          stats.holidays++;
        }
      }

      // Create booking with nested data
      await prisma.booking.create({
        data: {
          studentId: dbStudent!.id,
          agencyId,
          status: mapStatus(le.status, le.confirmed),
          confirmed: !!le.confirmed,
          serviceStart: parseDate(le.all_start),
          serviceEnd: parseDate(le.all_end),
          currency: 'EUR',
          amountTotal: le.amount ? parseFloat(le.amount) : null,
          amountPaid: le.payments ? parseFloat(le.payments) : null,
          amountOpen: le.amount_open ? parseFloat(le.amount_open) : null,
          amountRefund: le.amount_refund ? parseFloat(le.amount_refund) : null,
          fideloBookingId,
          dataSource: 'FIDELO',
          courses: coursesData.length > 0 ? { create: coursesData } : undefined,
          accommodations: accommData.length > 0 ? { create: accommData } : undefined,
          holidays: holidaysData.length > 0 ? { create: holidaysData } : undefined,
        } as any,
      });
      stats.bookings++;

      process.stdout.write(`\r  [${i+1}/${entries.length}] ${stats.bookings} bookings, ${stats.students} new students...`);
      await sleep(100); // Be polite to Fidelo API
    } catch (e: any) {
      console.log(`\n  ERROR on booking ${fideloBookingId}: ${e.message?.substring(0, 500)}`);
      stats.errors++;
      if (stats.errors >= 5) { console.log('Too many errors, stopping early.'); break; }
    }
  }

  console.log('\n\n=== Import Complete ===');
  console.log(`Students: ${stats.students} created, ${stats.studentsUpdated} updated`);
  console.log(`Bookings: ${stats.bookings} created, ${stats.bookingsSkipped} skipped (already imported), ${stats.territorySkipped} skipped (unsupported territory)`);
  console.log(`Courses: ${stats.courses}, Accommodation: ${stats.accommodations}, Holidays: ${stats.holidays}`);
  console.log(`Agencies matched/created: ${stats.agencies}`);
  console.log(`Errors: ${stats.errors}`);

  await prisma.$disconnect();
  await pool.end();
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

main().catch(e => { console.error(e); process.exit(1); });
