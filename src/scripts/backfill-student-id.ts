/**
 * One-shot backfill: write each SIS student id into the matching HubSpot
 * contact's `student_id` property (label "Student ID"), so the TM checkout
 * prefills the "Student number" field (it reads `student_id` first — see hub
 * `scripts/tm/pay.js prefillFromRef`).
 *
 * Scope: only students that already have a stored hubspotContactId. Without a
 * HubID there's no contact to target, so those rows are skipped. Idempotent —
 * re-running just overwrites `student_id` with the same value.
 *
 * The ongoing path (new students) is handled in src/routes/webhooks.ts via
 * pushSisStudentIdToHubspot(); this script covers the existing population.
 *
 * Usage:
 *   node dist/scripts/backfill-student-id.js              # dry-run, count only
 *   node dist/scripts/backfill-student-id.js --apply      # write to HubSpot
 *   node dist/scripts/backfill-student-id.js --apply --limit=10
 */

import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { pushSisStudentIdToHubspot } from './hubspot-contact-push';

dotenv.config();

const APPLY = process.argv.includes('--apply');
const limitArg = process.argv.find(a => a.startsWith('--limit='))?.split('=')[1];
const LIMIT = limitArg ? parseInt(limitArg, 10) : undefined;

const HS_TOKEN = process.env.ACCESS_TOKEN;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

async function main() {
  if (!HS_TOKEN) throw new Error('ACCESS_TOKEN not set — cannot reach HubSpot');

  const students = await prisma.student.findMany({
    where: { hubspotContactId: { not: null } },
    select: { id: true, hubspotContactId: true },
    orderBy: { id: 'asc' },
    ...(LIMIT ? { take: LIMIT } : {}),
  });

  console.log(`Students with a HubID: ${students.length}${LIMIT ? ` (limited to ${LIMIT})` : ''}`);
  if (!APPLY) {
    console.log('\nDRY-RUN — no HubSpot writes. Re-run with --apply to commit.');
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  let ok = 0;
  let failed = 0;
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const wrote = await pushSisStudentIdToHubspot(s.hubspotContactId, s.id, HS_TOKEN);
    if (wrote) ok++; else failed++;
    if ((i + 1) % 50 === 0) console.log(`  …${i + 1}/${students.length}`);
  }

  console.log('\n=== Summary ===');
  console.log(`Pushed:  ${ok}`);
  console.log(`Failed:  ${failed}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
