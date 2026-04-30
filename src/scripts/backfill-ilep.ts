/**
 * Backfill BookingCourse.ilepCode from booking-course name + student level.
 *
 * Run:
 *   npx ts-node src/scripts/backfill-ilep.ts            # dry-run (no writes)
 *   npx ts-node src/scripts/backfill-ilep.ts --live     # actually update
 *   npx ts-node src/scripts/backfill-ilep.ts --live --limit 100   # cap batch
 *
 * Rules (only Academic Year programmes — short/junior/private/general courses left null):
 *   "Academic Year Morning"   / "...Renewal Morning"   / "ULearn Renewal MORN"
 *     A2 → 0318/0020   B1 → 0318/0010   B2 → 0318/0011   C1 → 0318/0013
 *   "Academic Year Afternoon" / "...Renewal Afternoon" / "ULearn Renewal AFT"
 *     A2 → 0318/0021   B1 → 0318/0003   B2 → 0318/0004   C1 → 0318/0006
 *   IELTS variants are not auto-assigned (Premium vs Standard ambiguous from name).
 */

import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

type Session = 'AM' | 'PM';
const MORNING_NAMES = [
  'academic year morning',
  'academic year renewal morning',
  'ulearn renewal morn',
];
const AFTERNOON_NAMES = [
  'academic year afternoon',
  'academic year renewal afternoon',
  'ulearn renewal aft',
];

const ILEP_BY_SESSION_LEVEL: Record<Session, Record<string, string>> = {
  AM: { A2: '0318/0020', B1: '0318/0010', B2: '0318/0011', C1: '0318/0013' },
  PM: { A2: '0318/0021', B1: '0318/0003', B2: '0318/0004', C1: '0318/0006' },
};

function deriveSession(name: string): Session | null {
  const n = (name || '').toLowerCase().trim();
  if (MORNING_NAMES.some(p => n === p)) return 'AM';
  if (AFTERNOON_NAMES.some(p => n === p)) return 'PM';
  return null;
}

// EU/EEA + UK + Switzerland — these students don't need a visa letter, so they
// don't need an ILEP reference even if enrolled in an Academic Year programme.
const NON_VISA_NATIONALITIES = new Set([
  'IE','GB','DE','FR','ES','IT','PT','PL','CZ','NL','BE','AT','SE','DK','FI','NO',
  'RO','HU','BG','GR','SK','SI','EE','LV','LT','IS','LU','CH','MT','CY','HR',
]);

function deriveCode(name: string, level: string | null, nationality: string | null): string | null {
  if (nationality && NON_VISA_NATIONALITIES.has(nationality.toUpperCase())) return null;
  const session = deriveSession(name);
  if (!session) return null;
  const lvl = (level || '').toUpperCase().trim();
  return ILEP_BY_SESSION_LEVEL[session][lvl] || null;
}

async function main() {
  const live = process.argv.includes('--live');
  const limitFlag = process.argv.indexOf('--limit');
  const limit = limitFlag >= 0 ? parseInt(process.argv[limitFlag + 1] || '0') : 0;

  console.log(live ? '🔴 LIVE MODE — will write changes' : '🟢 DRY RUN — no writes');
  console.log('---');

  // Pull all booking courses with no ilepCode set, joined with student level.
  // Newest-first so we cover recent enrolments before old historical ones.
  const rows = await prisma.bookingCourse.findMany({
    where: { ilepCode: null },
    orderBy: { createdAt: 'desc' },
    take: limit > 0 ? limit : undefined,
    include: { booking: { include: { student: { select: { id: true, currentLevel: true, firstName: true, lastName: true, nationality: true } } } } },
  });

  let assigned = 0, skipped = 0;
  const skipReasons: Record<string, number> = {};
  const sample: any[] = [];

  for (const r of rows) {
    const studentLevel = r.level || r.booking?.student?.currentLevel || null;
    const studentNat = r.booking?.student?.nationality || null;
    const code = deriveCode(r.name, studentLevel, studentNat);
    if (code) {
      assigned++;
      if (sample.length < 10) {
        sample.push({
          bcId: r.id,
          student: `${r.booking?.student?.firstName} ${r.booking?.student?.lastName}`,
          courseName: r.name,
          level: studentLevel,
          code,
        });
      }
      if (live) {
        await prisma.bookingCourse.update({ where: { id: r.id }, data: { ilepCode: code } });
      }
    } else {
      skipped++;
      const reason = !deriveSession(r.name) ? `non-AY: ${r.name}` : `no level for ${r.name}`;
      skipReasons[reason] = (skipReasons[reason] || 0) + 1;
    }
  }

  console.log(`Total courses without ILEP: ${rows.length}`);
  console.log(`Would assign:               ${assigned}`);
  console.log(`Would skip:                 ${skipped}`);
  console.log('---');
  console.log('Top skip reasons:');
  for (const [k, v] of Object.entries(skipReasons).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`  ${v.toString().padStart(5)} × ${k}`);
  }
  console.log('---');
  console.log('Sample assignments (first 10):');
  for (const s of sample) console.log(' ', s);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
