// One-shot migration: add hold_placed_at + hold_placed_by columns to
// booking_accommodations. Idempotent — IF NOT EXISTS guards. Same pattern as
// migrate-challenge-threads.ts since `prisma db push` is blocked by drift on
// students.nationality.
import dotenv from 'dotenv';
dotenv.config();
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  await (prisma as any).$executeRawUnsafe(`
    ALTER TABLE booking_accommodations
      ADD COLUMN IF NOT EXISTS hold_placed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS hold_placed_by TEXT;
  `);
  console.log('booking_accommodations.hold_placed_at + hold_placed_by ready');

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
