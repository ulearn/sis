// Seed realistic challenge data for test.student (Neil Test26, id 95).
//   1) Insert PRESENT attendance for class 12 occurrences from Mon-of-week → today
//   2) Mark student 95 attended on the existing Howth Cliff Walk activity (id 2)
// Idempotent: re-running just upserts, won't duplicate rows.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  const studentId = 95;
  const classId = 12;

  // Window: Monday of this week → today, weekdays only
  const today = new Date(); today.setHours(0,0,0,0);
  const dow = (today.getDay() + 6) % 7;
  const monday = new Date(today); monday.setDate(monday.getDate() - dow);

  const occs: any[] = await (prisma as any).classOccurrence.findMany({
    where: { classId, date: { gte: monday, lte: today } },
    orderBy: { date: 'asc' },
  });
  console.log(`Found ${occs.length} occurrences for class ${classId} from ${monday.toISOString().slice(0,10)} → ${today.toISOString().slice(0,10)}`);

  let inserted = 0;
  for (const o of occs) {
    const existing: any = await (prisma as any).attendance.findFirst({
      where: { studentId, occurrenceId: o.id },
      select: { id: true },
    });
    if (existing) {
      console.log(`  skip occ ${o.id} (${o.date.toISOString().slice(0,10)}) — attendance row already exists (${existing.id})`);
      continue;
    }
    const r: any = await (prisma as any).attendance.create({
      data: { studentId, occurrenceId: o.id, status: 'PRESENT', hours: 4 } as any,
    });
    console.log(`  + attendance ${r.id} · occ ${o.id} · ${o.date.toISOString().slice(0,10)} · PRESENT`);
    inserted++;
  }

  // Activity attendee row — mark attended on Howth Cliff Walk (id 2)
  const activityId = 2;
  const exist: any = await (prisma as any).activityAttendee.findFirst({
    where: { studentId, activityId },
  });
  if (exist) {
    if (!exist.attended) {
      await (prisma as any).activityAttendee.update({
        where: { id: exist.id },
        data: { attended: true, attendedAt: new Date() } as any,
      });
      console.log(`  ~ updated activityAttendee ${exist.id} → attended=true`);
    } else {
      console.log(`  skip activityAttendee — already attended (${exist.id})`);
    }
  } else {
    const r: any = await (prisma as any).activityAttendee.create({
      data: { studentId, activityId, attended: true, attendedAt: new Date() } as any,
    });
    console.log(`  + activityAttendee ${r.id} · activity ${activityId} · attended=true`);
  }

  console.log(`\nSeed complete. ${inserted} attendance rows inserted.`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
