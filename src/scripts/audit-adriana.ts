// One-off: dump bookings, courses, class assignments, attendance for any
// student named like 'Adriana%' so we can see why she's appearing in B2 since
// 02 Mar when her booking starts 27/04/2026.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  const students: any[] = await prisma.student.findMany({
    where: {
      OR: [
        { firstName: { contains: 'Adriana', mode: 'insensitive' } },
        { lastName: { contains: 'McTest', mode: 'insensitive' } },
        { lastName: { contains: 'Mc Test', mode: 'insensitive' } },
        { firstName: { contains: 'Test', mode: 'insensitive' } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, email: true, currentLevel: true } as any,
  });
  console.log(`matched ${students.length} student(s):`);
  for (const s of students) console.log(`  #${s.id} ${s.firstName} ${s.lastName} (${s.email}) · level ${s.currentLevel}`);

  for (const s of students) {
    console.log(`\n=== Student #${s.id} ${s.firstName} ${s.lastName} ===`);
    const bookings: any[] = await prisma.booking.findMany({
      where: { studentId: s.id },
      orderBy: { id: 'desc' },
      select: {
        id: true, status: true, serviceStart: true, serviceEnd: true,
        amountPaid: true, amountTotal: true,
        courses: { select: { id: true, name: true, level: true, weeks: true, startDate: true, endDate: true, category: true, active: true } } as any,
      } as any,
    });
    console.log('bookings:');
    for (const b of bookings) {
      console.log(`  #${b.id} · ${b.status} · ${b.serviceStart?.toISOString().slice(0,10)} → ${b.serviceEnd?.toISOString().slice(0,10)} · €${b.amountPaid}/${b.amountTotal}`);
      for (const c of b.courses) {
        console.log(`     course #${c.id} · ${c.name} · ${c.level} · ${c.weeks}w · ${c.startDate?.toISOString().slice(0,10)} → ${c.endDate?.toISOString().slice(0,10)} · ${c.category} · active=${c.active}`);
      }
    }

    const assigns: any[] = await (prisma as any).studentClassAssignment.findMany({
      where: { studentId: s.id },
      include: { class_: { select: { id: true, name: true, level: true, session: true } } } as any,
      orderBy: { weekStart: 'asc' },
    });
    console.log(`class assignments (${assigns.length}):`);
    for (const a of assigns) {
      console.log(`  #${a.id} · class ${a.classId} ${a.class_?.name || '?'} (${a.class_?.level}/${a.class_?.session}) · bookingCourse=${a.bookingCourseId} · ${a.weekStart?.toISOString().slice(0,10)} → ${a.weekEnd?.toISOString().slice(0,10) || '∞'}`);
    }

    const att: any[] = await prisma.attendance.findMany({
      where: { studentId: s.id },
      select: { id: true, status: true, occurrence: { select: { date: true, classId: true } } } as any,
      orderBy: { id: 'asc' },
    });
    console.log(`attendance rows: ${att.length}`);
    for (const r of att.slice(-10)) {
      console.log(`  ${r.occurrence?.date?.toISOString().slice(0,10)} · class ${r.occurrence?.classId} · ${r.status}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
