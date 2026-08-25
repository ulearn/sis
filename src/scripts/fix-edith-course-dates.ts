// One-shot correction: the first reconcile-fidelo-courses.ts run used a
// parseDate variant that local-midnighted Fidelo's YYYY-MM-DD strings, which
// shaved one day off in BST. Course 64653 landed as 2026-04-19 → 2026-05-14
// instead of 2026-04-20 → 2026-05-15. Reconcile is fixed; this corrects the
// already-inserted row to match Fidelo.
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

(async () => {
  const updated = await prisma.bookingCourse.update({
    where: { fideloCourseId: 64653 },
    data: { startDate: new Date('2026-04-20'), endDate: new Date('2026-05-15') },
    select: { id: true, name: true, startDate: true, endDate: true, fideloCourseId: true },
  });
  console.log('Corrected:', updated);
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
