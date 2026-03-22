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

function fideloGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      path: encodeURI(path),
      headers: { 'Authorization': `Bearer ${API_TOKEN}` },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Parse error: ' + data.substring(0, 200))); }
      });
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
  if (confirmed) return 'CONFIRMED';
  return 'PENDING';
}

async function main() {
  console.log('=== Fidelo Import ===');
  console.log('Fetching bookings list from Fidelo API...');

  // Phase 1: Fetch bookings list
  const listData = await fideloGet('/api/1.0/ts/bookings?filter[accommodation_from_original]=2026-01-01&filter[accommodation_until_original]=2026-12-31');
  const entries = Object.entries(listData.entries || {});
  console.log(`Found ${entries.length} bookings`);

  const stats = { students: 0, studentsUpdated: 0, bookings: 0, bookingsSkipped: 0, courses: 0, accommodations: 0, holidays: 0, agencies: 0, errors: 0 };

  for (let i = 0; i < entries.length; i++) {
    const [bookingIdStr, listEntry] = entries[i] as [string, any];
    const fideloBookingId = parseInt(bookingIdStr);

    // Skip if already imported
    const existing = await prisma.booking.findUnique({ where: { fideloBookingId } });
    if (existing) { stats.bookingsSkipped++; continue; }

    try {
      // Fetch full booking detail
      const detail = await fideloGet(`/api/1.1/ts/booking/${fideloBookingId}`);
      const student = detail.data?.student;
      const booking = detail.data?.booking;
      if (!student || !booking) { console.log(`  [${i+1}] No student/booking data for ${fideloBookingId}, skipping`); stats.errors++; continue; }

      const le = listEntry as any; // list entry has flattened fields

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

      const studentData: any = {
        firstName: student.firstname || le.customer_firstname || 'Unknown',
        lastName: student.surname || le.customer_lastname || 'Unknown',
        email: student.email || le.email || '',
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
  console.log(`Bookings: ${stats.bookings} created, ${stats.bookingsSkipped} skipped (already imported)`);
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
