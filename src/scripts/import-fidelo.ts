import dotenv from 'dotenv';
import https from 'https';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { extractFees, pickBestInvoice } from './fidelo-fee-extractor';

dotenv.config();

// Canonicalise accommodation values from Fidelo's native naming to the
// canonical SIS values (school_config.accomm_types / accomm_room_types /
// accomm_board_types). The mapping mirrors migrate-canonicalise-accom.ts —
// keep the two in sync if values are added. Unknown inputs pass through
// unchanged so we don't silently drop new Fidelo categories; they'd surface
// as legacy values for staff to map next time.
const FIDELO_TYPE_MAP: Record<string, string> = {
  'Homestay': 'Host Family',
  'Apartment': 'City Centre Apartment',
  'Hostel': 'City Centre Apartment',
};
const FIDELO_ROOM_MAP: Record<string, string> = {
  'Individual room': 'Individual',
  'Shared Room': 'Twin/Shared',
  'Apt Premium Single': 'Premium',
  'Twin Room': 'Twin/Shared',
  'Apt Single Standard': 'Standard',
  'Apt Superior Single': 'Superior',
  'Double room': 'Double',
  'Single': 'Individual',
};
const FIDELO_BOARD_MAP: Record<string, string> = {
  'Full-board': 'Full Board',
  'Half-board': 'Half Board',
  'Self catering': 'Self Catering',
  'Half-board Christmas & New Year': 'Half Board',
};
function canonicaliseAccomType(v: any): string | null {
  if (!v) return null;
  const s = String(v).trim();
  return FIDELO_TYPE_MAP[s] || s;
}
function canonicaliseAccomRoom(v: any): string | null {
  if (!v) return null;
  const s = String(v).trim();
  return FIDELO_ROOM_MAP[s] || s;
}
function canonicaliseAccomBoard(v: any): string | null {
  if (!v) return null;
  const s = String(v).trim();
  return FIDELO_BOARD_MAP[s] || s;
}

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

// Include-inactive — when set, switches the list source to Fidelo's GUI2
// search endpoint and pulls bookings whose courses are NOT all_active. The
// regular /api/1.0/ts/bookings endpoint silently filters out inactive ones,
// so we have no other way to surface them. School staff use the Inactive
// flag in Fidelo as a workaround for visa-pending students whose money is
// in TransferMate escrow — these need to land in SIS with payment status
// ESCROW + student visa status Pending so the existing exclusion gates
// (balances, profit margin, accommodation matching, LoA gate) keep them
// out of operational views until their visa resolves.
//   --include-inactive             enable inactive-bookings sweep
const INCLUDE_INACTIVE = process.argv.includes('--include-inactive');

// Patch-existing — when set, bookings already in our DB get their top-level
// fields (status/confirmed/service dates/amounts) refreshed from the Fidelo
// list entry instead of being skipped. Original behaviour was "skip if exists",
// which left the DB stale whenever a course start date or amount changed in
// Fidelo after first import. Only applies to bookings whose existing
// serviceStart is on/after PATCH_START_AFTER (default 2025-07-01) to avoid
// churning historical records.
//   --patch-existing               enable update-on-exists
//   --start-after=YYYY-MM-DD       lower bound on existing serviceStart (default 2025-07-01)
const PATCH_EXISTING = process.argv.includes('--patch-existing');
const startAfterArg = process.argv.find(a => a.startsWith('--start-after='))?.split('=')[1];
const PATCH_START_AFTER = startAfterArg || '2025-07-01';
const patchStartAfterDate = new Date(PATCH_START_AFTER + 'T00:00:00Z');

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

// POST to Fidelo's GUI2 search endpoint with form-encoded filters. Used to
// reach bookings the regular ts/bookings list silently filters out (notably:
// inactive course-status, which schools use as a visa-pending workaround).
// The search-id hash is the GUI2 saved-search identifier; school's bookings
// list uses this fixed hash.
function fideloGui2Post(searchId: string, filters: Record<string, string | string[]>): Promise<any> {
  const params = new URLSearchParams();
  params.set('_token', API_TOKEN);
  for (const [k, v] of Object.entries(filters)) {
    if (Array.isArray(v)) for (const item of v) params.append(k, item);
    else params.set(k, v);
  }
  const body = params.toString();
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: API_HOST,
      path: `/api/1.0/gui2/${searchId}/search`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': 'Bearer ' + API_TOKEN,
      },
    }, (res) => {
      let buf = '';
      res.on('data', (c) => buf += c);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
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
  if (INCLUDE_INACTIVE) {
    console.log(`Include-inactive: ON — using GUI2 search to surface inactive bookings (force ESCROW + visaStatus=Pending)`);
  }
  console.log('Fetching bookings list from Fidelo API...');

  // Phase 1: Fetch bookings list. Two source endpoints:
  //   - GUI2 saved-search: surfaces inactive course bookings (school's
  //     visa-pending workaround). Different schema (POST + form-encoded).
  //   - ts/bookings: the regular list, active only.
  let listData: any;
  if (INCLUDE_INACTIVE) {
    // The school's GUI2 saved-search hash for the bookings list.
    const SEARCH_ID = 'b56eab683e450abb7100bfa45fc238fd';
    // Fidelo's confirmed_date filter expects DD/MM/YYYY,DD/MM/YYYY (range).
    // Convert FROM_DATE (YYYY-MM-DD) → DD/MM/YYYY. TO is open-ended (just trailing comma).
    const [yy, mm, dd] = FROM_DATE.split('-');
    const fromDmy = `${dd}/${mm}/${yy}`;
    const toDmy = TO_DATE ? (() => { const [y, m, d] = TO_DATE.split('-'); return `${d}/${m}/${y}`; })() : '';
    listData = await fideloGui2Post(SEARCH_ID, {
      'filter[courses_status_original][]': 'all_active',
      'filter[courses_status_original_negate]': '1',
      'filter[confirmed_date_original]': `${fromDmy},${toDmy}`,
      limit: '500',
      per_page: '500',
    });
  } else {
    listData = await fideloGet(`/api/1.0/ts/bookings?filter[all_end_original]=${dateFilter}`);
  }
  const entries = Object.entries(listData.entries || {});
  console.log(`Found ${entries.length} bookings`);

  const stats = { students: 0, studentsUpdated: 0, bookings: 0, bookingsSkipped: 0, bookingsPatched: 0, territorySkipped: 0, courses: 0, coursesWithFee: 0, accommodations: 0, accommsWithFee: 0, holidays: 0, agencies: 0, errors: 0 };

  for (let i = 0; i < entries.length; i++) {
    const [bookingIdStr, listEntry] = entries[i] as [string, any];
    const fideloBookingId = parseInt(bookingIdStr);

    // Already imported? Skip — or, with --patch-existing, refresh fields that
    // commonly drift after first import: payments/amounts on the booking, and
    // visa/passport/contact fields on the linked student. Everything we need
    // is on the LIST entry — no per-booking detail fetch required, which keeps
    // the nightly diff cheap. Nested course / accommodation / holiday rows are
    // deliberately left alone (those need fideloCourseId-level matching).
    const existing = await prisma.booking.findUnique({ where: { fideloBookingId } });
    if (existing) {
      const le = listEntry as any;
      const eligibleForPatch = PATCH_EXISTING
        && existing.serviceStart
        && existing.serviceStart >= patchStartAfterDate;
      if (eligibleForPatch) {
        // Resolve agency from list entry (cheap — DB only).
        let patchAgencyId: number | null = existing.agencyId ?? null;
        if (le.agency_id) {
          const fideloAgencyId = parseInt(le.agency_id);
          const ag = await prisma.agency.findFirst({ where: { fideloAgencyId } });
          if (ag) patchAgencyId = ag.id;
        }

        // Patch booking top-level (payments are the main thing that drifts).
        // Note on amountTotal: we deliberately DON'T overwrite the existing
        // value from le.amount because Fidelo sometimes serves gross there,
        // which would unwind the net total computed at create time. Cap
        // amountPaid at the existing net total so gross-side over-payments
        // don't manifest as phantom overpayments. See net-gross.md.
        const existingTotal = existing.amountTotal !== null && existing.amountTotal !== undefined
          ? Number(existing.amountTotal) : null;
        const grossPaidPatch = le.payments ? parseFloat(le.payments) : null;
        const cappedPaid = (grossPaidPatch !== null && existingTotal !== null && grossPaidPatch > existingTotal)
          ? existingTotal : grossPaidPatch;
        const computedOpen = (existingTotal !== null && cappedPaid !== null)
          ? Math.max(0, existingTotal - cappedPaid)
          : (le.amount_open ? parseFloat(le.amount_open) : null);
        await prisma.booking.update({
          where: { id: existing.id },
          data: {
            agencyId: patchAgencyId,
            status: mapStatus(le.status, le.confirmed),
            confirmed: !!le.confirmed,
            serviceStart: parseDate(le.all_start),
            serviceEnd: parseDate(le.all_end),
            // amountTotal intentionally NOT updated — preserves net total set at create time.
            amountPaid: cappedPaid,
            amountOpen: computedOpen,
            amountRefund: le.amount_refund ? parseFloat(le.amount_refund) : null,
          } as any,
        });

        // Patch linked student — visa/passport/contact occasionally update.
        // Empty Fidelo values are dropped so we never blank hand-entered SIS data.
        const visumPass = (le.visum_passport_number_original || '').toString().trim() || null;
        const visumPassFrom = parseDate(le.visum_date_of_issue_original);
        const visumPassUntil = parseDate(le.visum_due_date_original);
        const visumVisaFrom = parseDate(le.visum_date_from_original);
        const visumVisaUntil = parseDate(le.visum_date_until_original);
        const rawEmailP = le.email || le.customer_email || '';
        const normEmailP = Array.isArray(rawEmailP) ? (rawEmailP[0] || '') : String(rawEmailP);
        const studentPatch: any = {
          ...(normEmailP ? { email: normEmailP } : {}),
          ...(le.customer_tel ? { phone: (stripHtml(le.customer_tel) || '').substring(0, 50) || null } : {}),
          ...(le.customer_mobile ? { phoneMobile: (stripHtml(le.customer_mobile) || '').substring(0, 50) || null } : {}),
          ...(le.customer_address ? { address: stripHtml(le.customer_address) } : {}),
          ...(le.customer_city ? { city: stripHtml(le.customer_city) } : {}),
          ...(le.customer_zip ? { zip: stripHtml(le.customer_zip) } : {}),
          ...(le.customer_country_original ? { countryIso: (le.customer_country_original || '').substring(0, 2) } : {}),
          ...(visumPass       ? { passportNumber:     visumPass       } : {}),
          ...(visumPassFrom   ? { passportValidFrom:  visumPassFrom   } : {}),
          ...(visumPassUntil  ? { passportValidUntil: visumPassUntil  } : {}),
          ...(visumVisaFrom   ? { visaFrom:           visumVisaFrom   } : {}),
          ...(visumVisaUntil  ? { visaUntil:          visumVisaUntil  } : {}),
        };
        if (Object.keys(studentPatch).length > 0) {
          await prisma.student.update({ where: { id: existing.studentId }, data: studentPatch });
        }

        stats.bookingsPatched++;
        continue;
      }
      stats.bookingsSkipped++;
      continue;
    }

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
      const detail = await fideloGet(`/api/1.1/ts/booking/${fideloBookingId}?include_inactive_services=1`);
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

      // Fidelo's Visa & Passport block is exposed via the visum_* fields on
      // the bookings-list entry (NOT the booking-detail endpoint, which has
      // no passport/visa data). Coverage is ~65% on recent bookings.
      // Map:  visum_passport_number_original → passportNumber
      //       visum_date_of_issue_original   → passportValidFrom
      //       visum_due_date_original        → passportValidUntil
      //       visum_date_from_original       → visaFrom
      //       visum_date_until_original      → visaUntil
      //       visa_required                  → visaRequired
      // Empty values are dropped from the upsert so we never blank a
      // hand-entered SIS value just because Fidelo's blank.
      const visumPass = (le.visum_passport_number_original || '').toString().trim() || null;
      const visumPassFrom = parseDate(le.visum_date_of_issue_original);
      const visumPassUntil = parseDate(le.visum_due_date_original);
      const visumVisaFrom = parseDate(le.visum_date_from_original);
      const visumVisaUntil = parseDate(le.visum_date_until_original);

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
        // Visa/Passport — only set on the upsert when Fidelo has a value.
        ...(visumPass       ? { passportNumber:     visumPass       } : {}),
        ...(visumPassFrom   ? { passportValidFrom:  visumPassFrom   } : {}),
        ...(visumPassUntil  ? { passportValidUntil: visumPassUntil  } : {}),
        ...(visumVisaFrom   ? { visaFrom:           visumVisaFrom   } : {}),
        ...(visumVisaUntil  ? { visaUntil:          visumVisaUntil  } : {}),
        // --include-inactive sweep: Fidelo's Inactive flag is the school's
        // visa-pending escrow workaround, so any student arriving via this
        // path defaults to visaStatus='Pending' (won't blank a hand-set value
        // because the upsert path only writes this when we're explicitly in
        // the inactive sweep AND no value is already set on the SIS side).
        ...(INCLUDE_INACTIVE && !dbStudent?.visaStatus ? { visaStatus: 'Pending' } : {}),
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
      const courseFeeInputs: { name: string; from: string | null; until: string | null; weeks: number | null; hoursPerWeek: number | null }[] = [];
      if (booking.courses) {
        for (const [courseId, course] of Object.entries(booking.courses) as [string, any][]) {
          const category = mapCourseCategory(course.category);
          const hpw = getHoursPerWeek(category);
          coursesData.push({
            name: course.name || 'Unknown Course',
            category,
            level: null, // level is on assignments, not course
            startDate: parseDate(course.from),
            endDate: parseDate(course.until),
            weeks: course.weeks || null,
            hoursPerWeek: hpw,
            active: course.active === 1,
            fideloCourseId: parseInt(courseId),
          });
          courseFeeInputs.push({
            name: course.name || '',
            from: course.from || null,
            until: course.until || null,
            weeks: course.weeks ? Number(course.weeks) : null,
            hoursPerWeek: hpw,
          });
          stats.courses++;
        }
      }

      // Map accommodation. Fidelo returns the array under `accommodations` (plural)
      // — earlier code looked for `accommodation` (singular) which silently dropped
      // every accom row across all 17,816 historical Fidelo imports. Fixed here.
      const accommData: any[] = [];
      const accomFeeInputs: { from: string | null; until: string | null; weeks: number | null }[] = [];
      const accomSource = (booking as any).accommodations || (booking as any).accommodation;
      if (accomSource) {
        for (const [accommId, accomm] of Object.entries(accomSource || {}) as [string, any][]) {
          accommData.push({
            accommodationType: canonicaliseAccomType(accomm.category),
            roomType: canonicaliseAccomRoom(accomm.roomtype),
            board: canonicaliseAccomBoard(accomm.board),
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
          stats.accommodations++;
        }
      }

      // Extract per-course / per-accommodation fees from invoice line items.
      // Fidelo exposes these on detail.invoices[].items[] — see fidelo-fee-extractor.ts.
      const invoices = (detail as any)?.data?.invoices || (detail as any)?.invoices || [];
      const fees = extractFees({ courses: courseFeeInputs, accommodations: accomFeeInputs, invoices });
      coursesData.forEach((c, i) => {
        if (fees.courseFees[i] > 0) { c.fee = fees.courseFees[i]; stats.coursesWithFee++; }
      });
      accommData.forEach((a, i) => {
        if (fees.accommodationFees[i] > 0) { a.fee = fees.accommodationFees[i]; stats.accommsWithFee++; }
      });

      // Derive the canonical NET total from the chosen invoice's line items.
      // This is what ULearn actually invoices the student/agent — the agent's
      // commission slice has already been subtracted out. Falling back to
      // le.amount only when no invoice exists keeps legacy bookings importable.
      // See .claude/docs/agencies/net-gross.md — gross is a display fiction;
      // the legal demand and the SIS source of truth is net.
      const canonicalInvoice = pickBestInvoice(invoices as any[]);
      let netTotal: number | null = null;
      if (canonicalInvoice?.items?.length) {
        netTotal = canonicalInvoice.items.reduce(
          (sum: number, it: any) => sum + (Number(it.amount_net) || 0), 0
        );
        // Non-positive net = picked a credit-note or refund-side invoice; fall back.
        if (netTotal <= 0) netTotal = null;
      }
      const fallbackTotal = le.amount ? parseFloat(le.amount) : null;
      const finalTotal = netTotal ?? fallbackTotal;
      // Cap amount_paid at the net total so gross/net mismatch stops manifesting
      // as a phantom overpayment in the SIS ledger. Real overpayments (rare —
      // someone genuinely paid extra) get clamped, which is acceptable for the
      // 99% case; we can revisit if Antonella spots a true overpayment masked.
      const grossPaid = le.payments ? parseFloat(le.payments) : null;
      const finalPaid = (grossPaid !== null && finalTotal !== null && grossPaid > finalTotal)
        ? finalTotal
        : grossPaid;
      const finalOpen = (finalTotal !== null && finalPaid !== null)
        ? Math.max(0, finalTotal - finalPaid)
        : (le.amount_open ? parseFloat(le.amount_open) : null);

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
      // --include-inactive forces booking status to ESCROW so the existing
      // gating in balances/profitMargin/partner totals/accommodation matching
      // keeps these out of operational views until the visa decision lands.
      const computedStatus = INCLUDE_INACTIVE ? 'ESCROW' : mapStatus(le.status, le.confirmed);
      await prisma.booking.create({
        data: {
          studentId: dbStudent!.id,
          agencyId,
          status: computedStatus,
          confirmed: !!le.confirmed,
          serviceStart: parseDate(le.all_start),
          serviceEnd: parseDate(le.all_end),
          currency: 'EUR',
          amountTotal: finalTotal,
          amountPaid: finalPaid,
          amountOpen: finalOpen,
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
  console.log(`Bookings: ${stats.bookings} created, ${stats.bookingsPatched} patched (existing refreshed from Fidelo), ${stats.bookingsSkipped} skipped (already imported), ${stats.territorySkipped} skipped (unsupported territory)`);
  console.log(`Courses: ${stats.courses} (${stats.coursesWithFee} with fee), Accommodation: ${stats.accommodations} (${stats.accommsWithFee} with fee), Holidays: ${stats.holidays}`);
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
