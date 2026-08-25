import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const p = new PrismaClient({ adapter } as any);

  // 1. Mélie's class assignments
  const melieAssignments: any[] = await (p as any).studentClassAssignment.findMany({
    where: { studentId: 14498 },
    include: { class_: true },
    orderBy: { weekStart: 'asc' },
  });
  console.log(`\n=== Mélie (student 14498) class assignments: ${melieAssignments.length} ===`);
  for (const a of melieAssignments) {
    console.log(`  - cls ${a.classId} "${a.class_.name}" ${a.class_.session} ${a.class_.startTime}-${a.class_.endTime}  weekStart ${a.weekStart.toISOString().slice(0,10)}`);
  }

  // 2. Are there any "Plus"-flavoured classes at all? (look for early/late hours)
  const allClasses: any[] = await (p as any).class.findMany({
    where: { active: true },
    orderBy: [{ session: 'asc' }, { startTime: 'asc' }],
  });
  console.log(`\n=== All active classes: ${allClasses.length} ===`);
  for (const c of allClasses) {
    console.log(`  - cls ${c.id.toString().padEnd(4)} "${c.name.padEnd(20)}" ${c.session.padEnd(10)} ${c.startTime}-${c.endTime}  level=${c.level}  private=${c.isPrivate}`);
  }

  // 3. Plus-class detection: any classes that look like extra-hour (12:30-13:30 range, between morning and afternoon)?
  const plusLooking = allClasses.filter((c: any) => {
    const t = (c.startTime || '').slice(0, 5);
    return /^(12:|13:00|13:15|13:30)/.test(t);
  });
  console.log(`\n=== Plus-candidate classes (start 12:xx-13:30): ${plusLooking.length} ===`);
  for (const c of plusLooking) {
    const assignments = await (p as any).studentClassAssignment.count({ where: { classId: c.id } });
    console.log(`  - cls ${c.id} "${c.name}" ${c.startTime}-${c.endTime}  enrolment count: ${assignments}`);
  }

  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
