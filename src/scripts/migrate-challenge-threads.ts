// One-shot migration: create student_challenge_threads table.
// Idempotent — uses IF NOT EXISTS. Mirrors the StudentChallengeThread model
// in prisma/schema.prisma. Drift on students.nationality currently blocks
// `prisma db push`, so we apply this directly the same way we did for
// AccommodationProvider's active_from/active_to columns.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  await (prisma as any).$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS student_challenge_threads (
      id                   SERIAL PRIMARY KEY,
      created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
      student_id           INTEGER NOT NULL,
      cycle_start          DATE NOT NULL,
      cycle_kind           TEXT NOT NULL DEFAULT 'WEEK',
      channel              TEXT NOT NULL,
      thread_ts            TEXT NOT NULL,
      notified_course_100  BOOLEAN NOT NULL DEFAULT FALSE,
      CONSTRAINT student_challenge_threads_student_cycle_unique UNIQUE (student_id, cycle_start)
    );
  `);
  await (prisma as any).$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS student_challenge_threads_student_idx
      ON student_challenge_threads (student_id);
  `);
  console.log('student_challenge_threads ready');

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
