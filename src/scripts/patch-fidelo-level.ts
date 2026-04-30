/**
 * Patch-sync Fidelo current CEFR level back into SIS.
 *
 * The original Fidelo importer skipped level (set to null with a TODO).
 * The Fidelo bookings list endpoint exposes `current_level_intern_short`
 * — a ready-made CEFR string ('A1', 'B1', 'C2', etc.). We pull that for
 * each student with a fidelo_contact_id and a null current_level.
 *
 * Run:
 *   node dist/scripts/patch-fidelo-level.js                # dry-run
 *   node dist/scripts/patch-fidelo-level.js --live         # actually update
 *   node dist/scripts/patch-fidelo-level.js --live --limit 50
 */
import dotenv from 'dotenv';
import pg from 'pg';
import https from 'https';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const FIDELO_TOKEN = process.env.FIDELO_API_TOKEN!;
if (!FIDELO_TOKEN) { console.error('FIDELO_API_TOKEN missing'); process.exit(1); }

const ALLOWED_LEVELS = new Set(['A0','A1','A2','B1','B2','C1','C2']);

function fideloFetch(contactId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'ulearn.fidelo.com',
      path: `/api/1.0/ts/bookings?filter%5Bcontact_id%5D=${contactId}`,
      headers: { Authorization: `Bearer ${FIDELO_TOKEN}`, Accept: 'application/json' },
      timeout: 15000,
    };
    https.get(opts, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
    }).on('error', reject).on('timeout', () => reject(new Error('timeout')));
  });
}

// Pick the most informative level value across that contact's bookings.
function pickLevel(payload: any): string | null {
  const entries = payload?.entries || {};
  const candidates: string[] = [];
  for (const e of Object.values(entries) as any[]) {
    const lvl = (e?.current_level_intern_short || '').toString().trim().toUpperCase();
    if (lvl && ALLOWED_LEVELS.has(lvl)) candidates.push(lvl);
  }
  return candidates[0] || null;  // most-recent booking is first per Fidelo's order
}

async function main() {
  const live = process.argv.includes('--live');
  const limitFlag = process.argv.indexOf('--limit');
  const limit = limitFlag >= 0 ? parseInt(process.argv[limitFlag + 1] || '0') : 0;

  console.log(live ? '🔴 LIVE MODE' : '🟢 DRY RUN');
  console.log('---');

  const students = await prisma.student.findMany({
    where: { fideloContactId: { not: null }, currentLevel: null },
    select: { id: true, fideloContactId: true, firstName: true, lastName: true },
    orderBy: { id: 'desc' },
    take: limit > 0 ? limit : undefined,
  });

  console.log(`Candidates (null level + fidelo_contact_id): ${students.length}`);

  let assigned = 0, noLevel = 0, errors = 0;
  const sample: any[] = [];
  let i = 0;

  for (const s of students) {
    i++;
    if (i % 50 === 0) process.stdout.write(`  ...${i} processed (${assigned} assigned)\r`);
    try {
      const payload = await fideloFetch(s.fideloContactId!);
      const lvl = pickLevel(payload);
      if (lvl) {
        assigned++;
        if (sample.length < 10) {
          sample.push({ studentId: s.id, name: `${s.firstName} ${s.lastName}`, level: lvl });
        }
        if (live) {
          await prisma.student.update({ where: { id: s.id }, data: { currentLevel: lvl } });
        }
      } else {
        noLevel++;
      }
    } catch (e) {
      errors++;
    }
    // small throttle — don't hammer Fidelo
    if (i % 5 === 0) await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nProcessed: ${i}`);
  console.log(`  Level found:  ${assigned}`);
  console.log(`  No level:     ${noLevel}`);
  console.log(`  Errors:       ${errors}`);
  console.log('---');
  console.log('Sample assignments:');
  for (const s of sample) console.log(' ', s);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
