#!/usr/bin/env node
/**
 * July open Progress-Post competition — cohort tag / revert.
 *
 * Temporary band-aid (Neil, July 2026): open the €500 Progress-Post leaderboard
 * to every student in school during July, not just KickStart challengers. Rather
 * than flip people to "KickStart" (which would make the temporary crowd
 * indistinguishable from real challengers at month-end), we tag them with a
 * DISTINCT value — Booking.hubspotChallenge = 'July'.
 *
 *   • The leaderboard already keys on hubspotChallenge != null, so 'July'
 *     students join the SAME pool as KickStart automatically (no pool change).
 *   • challenges() scopes the 'July' cohort's tab to just 2 tasks (Connect +
 *     Progress Posts) — see src/scripts/student.ts.
 *   • August revert is one line: clear every 'July' tag. That's the whole
 *     toggle — the tag's presence IS the on/off switch.
 *
 * Cohort = bookings with an ACTIVE course whose dates OVERLAP July, status not
 * CANCELLED/PENDING, and hubspotChallenge currently NULL (never overwrite a real
 * KickStart/CashBack value).
 *
 * Usage:
 *   node src/scripts/tag-july-cohort.js            # dry-run (default) — shows who WOULD be tagged
 *   node src/scripts/tag-july-cohort.js --apply    # tag the cohort 'July'
 *   node src/scripts/tag-july-cohort.js --revert            # dry-run of the revert
 *   node src/scripts/tag-july-cohort.js --revert --apply    # clear every 'July' tag (August)
 */
require('dotenv').config({ quiet: true });
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../../dist/generated/prisma/client');

const APPLY = process.argv.includes('--apply');
const REVERT = process.argv.includes('--revert');

// July window (UTC — booking_course dates are @db.Date stored at UTC midnight).
const JULY_START = new Date('2026-07-01T00:00:00Z');
const JULY_END = new Date('2026-07-31T23:59:59Z');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

(async () => {
  if (REVERT) {
    const tagged = await prisma.booking.findMany({
      where: { hubspotChallenge: 'July' },
      select: { id: true, studentId: true },
    });
    console.log(`REVERT — bookings currently tagged 'July': ${tagged.length}`);
    if (!APPLY) { console.log('(dry-run — pass --apply to clear them)'); await prisma.$disconnect(); return; }
    const r = await prisma.booking.updateMany({ where: { hubspotChallenge: 'July' }, data: { hubspotChallenge: null } });
    console.log(`✓ cleared 'July' from ${r.count} bookings.`);
    await prisma.$disconnect();
    return;
  }

  // TAG: bookings with an active course overlapping July, not cancelled/pending,
  // and no existing challenge value (so real KickStart/CashBack is never touched).
  const bookings = await prisma.booking.findMany({
    where: {
      hubspotChallenge: null,
      OR: [{ status: null }, { status: { notIn: ['CANCELLED', 'PENDING'] } }],
      courses: { some: { active: true, startDate: { lte: JULY_END }, endDate: { gte: JULY_START } } },
    },
    select: {
      id: true, studentId: true,
      student: { select: { firstName: true, lastName: true } },
      courses: { where: { active: true }, select: { name: true, startDate: true, endDate: true } },
    },
    orderBy: { id: 'asc' },
  });

  const students = new Set(bookings.map(b => b.studentId));
  console.log(`TAG — bookings overlapping July, uncancelled, no existing challenge: ${bookings.length} (${students.size} students)`);
  bookings.slice(0, 15).forEach(b => {
    const c = b.courses.find(x => x.startDate <= JULY_END && x.endDate >= JULY_START) || b.courses[0];
    const nm = `${b.student?.firstName || ''} ${b.student?.lastName || ''}`.trim();
    console.log(`  bk ${b.id} · ${nm} · ${c ? c.name + ' ' + c.startDate.toISOString().slice(0, 10) + '→' + c.endDate.toISOString().slice(0, 10) : '(no course)'}`);
  });
  if (bookings.length > 15) console.log(`  … and ${bookings.length - 15} more`);

  if (!APPLY) { console.log('\n(dry-run — pass --apply to tag them \'July\')'); await prisma.$disconnect(); return; }

  const r = await prisma.booking.updateMany({
    where: { id: { in: bookings.map(b => b.id) } },
    data: { hubspotChallenge: 'July' },
  });
  console.log(`\n✓ tagged ${r.count} bookings 'July' (${students.size} students now in the open competition).`);
  await prisma.$disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
