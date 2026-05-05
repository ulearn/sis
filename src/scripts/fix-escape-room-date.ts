// Escape Room (#3) is currently dated 2026-05-04 in the DB but Kelly meant
// 2026-05-05 — same UTC drift bug just fixed in activities.ts. One-shot fix.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  const before: any = await (prisma as any).activity.findUnique({ where: { id: 3 } });
  console.log('before:', before?.title, before?.date?.toISOString());

  // Use UTC midnight from the intended local Y/M/D
  const target = new Date(Date.UTC(2026, 4, 5)); // May = month 4 (0-indexed)
  const updated: any = await (prisma as any).activity.update({
    where: { id: 3 },
    data: { date: target } as any,
  });
  console.log('after :', updated.title, updated.date?.toISOString());

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
