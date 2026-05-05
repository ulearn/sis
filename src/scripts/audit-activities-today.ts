// What does studentFeed actually return today, and how does the date round-trip?
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { activitiesScripts } from './activities';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  console.log('server now:', new Date().toString());
  console.log('server tz offset:', new Date().getTimezoneOffset(), 'min');

  // Raw activities table — recent + future
  const all: any[] = await (prisma as any).activity.findMany({
    where: { date: { gte: new Date('2026-04-25'), lte: new Date('2026-05-12') } },
    orderBy: { date: 'asc' },
  });
  console.log(`\nactivity rows in DB ${'2026-04-25'} → ${'2026-05-12'}:`);
  for (const a of all) {
    const d: Date = a.date;
    const iso = d.toISOString();
    const ymdLocal = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    console.log(`  #${a.id} raw=${iso} · ymd(local)=${ymdLocal} · ${a.title}`);
  }

  // Run the actual studentFeed endpoint logic for student 97 (Adriana McTest)
  const acts = activitiesScripts(prisma);
  const feed = await acts.studentFeed(97);
  console.log(`\nstudentFeed(97) returned ${feed.length} item(s):`);
  for (const a of feed) {
    const d: Date = a.date as any;
    console.log(`  #${a.id} raw=${d.toISOString?.() || d} · ${a.title} · myRsvp=${JSON.stringify(a.myRsvp)}`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
