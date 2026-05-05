import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);
  const rows = await prisma.classroom.findMany();
  console.log('classrooms:');
  for (const r of rows) console.log(' #' + r.id, r.name, 'cap=' + r.capacity, 'active=' + r.active);
  // What classroom does class B2/MORNING (id 4) use?
  const cls = await prisma.class.findUnique({ where: { id: 4 }, include: { classroom: true } });
  console.log('\nclass 4 →', cls?.name, 'classroom=', cls?.classroom?.name, 'startTime=', cls?.startTime, 'endTime=', cls?.endTime, 'days=', (cls as any)?.days);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
