// All activities ordered by id desc — to surface anything Kelly created that
// might not be falling into the studentFeed window.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  const all: any[] = await (prisma as any).activity.findMany({
    orderBy: { id: 'desc' },
    take: 20,
  });
  console.log(`latest ${all.length} activities (any date):`);
  for (const a of all) {
    console.log(`  #${a.id} date=${a.date.toISOString()} createdBy=${a.createdBy} title="${a.title}"`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
