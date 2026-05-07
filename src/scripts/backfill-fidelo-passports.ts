// One-shot backfill: walk every SIS Booking with a fideloBookingId, hit
// Fidelo's /api/1.0/ts/bookings/:id, and update Student.passportNumber when
// (a) Fidelo has a non-empty passport_number and (b) SIS doesn't have one
// already. Never overwrites — staff hand-entered passports always win.
//
// Pass --apply to actually write. Default is dry-run.
//   --limit=N    cap the number of bookings probed (handy for a smoke test)
//   --concurrency=N (default 4) — Fidelo throttles, keep modest
import dotenv from 'dotenv'; dotenv.config();
import https from 'https';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const API_HOST = 'ulearn.fidelo.com';
const API_TOKEN = process.env.FIDELO_API_TOKEN!;

function fideloGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get({ host: API_HOST, path, headers: { Authorization: `Bearer ${API_TOKEN}` } }, res => {
      const ch: Buffer[] = [];
      res.on('data', c => ch.push(c));
      res.on('end', () => { try { resolve(JSON.parse(Buffer.concat(ch).toString())); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

const apply = process.argv.includes('--apply');
const limit = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '0') || 0;
const concurrency = parseInt(process.argv.find(a => a.startsWith('--concurrency='))?.split('=')[1] || '4');
// Scope to bookings whose course/service started on/after this date.
// Empty = unscoped (every fidelo-linked student). Use to focus on recent
// cohorts where Fidelo passport capture is likelier.
const fromDate = process.argv.find(a => a.startsWith('--from='))?.split('=')[1] || null;

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  // Candidates: bookings linked to a student that still has no passport.
  // Group by studentId so we don't re-probe the same passport via multiple
  // bookings. Take the most recent booking per student — most likely to have
  // current data in Fidelo.
  const rows: { studentId: number; fideloBookingId: number }[] = fromDate
    ? await (prisma as any).$queryRaw`
        SELECT DISTINCT ON (s.id) s.id AS "studentId", b.fidelo_booking_id AS "fideloBookingId"
        FROM students s
        JOIN bookings b ON b.student_id = s.id
        WHERE (s.passport_number IS NULL OR s.passport_number = '')
          AND b.fidelo_booking_id IS NOT NULL
          AND b.service_start >= ${fromDate}::date
        ORDER BY s.id, b.fidelo_booking_id DESC
      `
    : await (prisma as any).$queryRaw`
        SELECT DISTINCT ON (s.id) s.id AS "studentId", b.fidelo_booking_id AS "fideloBookingId"
        FROM students s
        JOIN bookings b ON b.student_id = s.id
        WHERE (s.passport_number IS NULL OR s.passport_number = '')
          AND b.fidelo_booking_id IS NOT NULL
        ORDER BY s.id, b.fidelo_booking_id DESC
      `;

  const todo = limit ? rows.slice(0, limit) : rows;
  console.log(`Probing ${todo.length} bookings${fromDate ? ` (service_start ≥ ${fromDate})` : ''} (concurrency=${concurrency}, ${apply ? 'APPLY' : 'dry-run'})…`);

  let probed = 0, found = 0, written = 0, errors = 0;
  const batchSize = concurrency;
  for (let i = 0; i < todo.length; i += batchSize) {
    const batch = todo.slice(i, i + batchSize);
    await Promise.all(batch.map(async ({ studentId, fideloBookingId }) => {
      probed++;
      try {
        const data = await fideloGet(`/api/1.0/ts/bookings/${fideloBookingId}`);
        const le = data.entries && Object.values(data.entries)[0] as any;
        const pn = (le?.passport_number || '').toString().trim();
        if (!pn) return;
        found++;
        if (apply) {
          await (prisma as any).student.update({ where: { id: studentId }, data: { passportNumber: pn } });
          written++;
        } else {
          console.log(`  would set s#${studentId} → ${pn} (fb#${fideloBookingId})`);
        }
      } catch (e) {
        errors++;
        console.error(`  fb#${fideloBookingId} error: ${(e as any).message}`);
      }
    }));
    if ((i + batchSize) % 200 === 0) {
      console.log(`… ${probed}/${todo.length} probed, ${found} found, ${written} written, ${errors} errors`);
    }
  }

  console.log(`\nDone. Probed ${probed} · Found passports ${found} · Written ${written} · Errors ${errors}`);
  console.log(apply ? 'Applied.' : 'Dry-run only — pass --apply to write.');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
