import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const p = new PrismaClient({ adapter } as any);
  const b: any = await p.booking.findUnique({ where: { id: 17897 }, include: { courses: true } });
  console.log('Booking 17897 courses:', b.courses.length);
  for (const c of b.courses) console.log(' -', c.id, c.name, c.category, c.weeks + 'w', '€' + c.fee, c.startDate.toISOString().slice(0,10), '->', c.endDate.toISOString().slice(0,10));
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
