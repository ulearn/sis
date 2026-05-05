// One-off diagnostic: dump everything that powers the Challenges page for
// test.student (Adriana Mc Test) so we can see why "Attended Course" and
// "Attended Social" don't wire up to live data.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  // Resolve the user → student id (SisUser links to Student via email)
  const u: any = await (prisma as any).sisUser.findUnique({
    where: { username: 'test.student' },
    select: { id: true, email: true, role: true, userType: true } as any,
  });
  console.log('sisUser.test.student →', u);
  let sid: number | null = null;
  if (u?.email) {
    const s: any = await prisma.student.findFirst({
      where: { email: u.email },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    console.log('matched student by email →', s);
    sid = s?.id ?? null;
  }
  if (!sid) { console.log('No student id resolved.'); process.exit(1); }

  const s: any = await prisma.student.findUnique({
    where: { id: sid },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      currentLevel: true, profilePicture: true,
      instagramHandle: true, instagramFollowVerified: true,
    } as any,
  });
  console.log('student →', s);

  // Booking + courses (used for periodKind decision)
  const bookings: any[] = await prisma.booking.findMany({
    where: { studentId: sid },
    orderBy: { id: 'desc' },
    select: { id: true, serviceStart: true, serviceEnd: true, courses: { select: { name: true, weeks: true } } } as any,
  });
  console.log('\nbookings:');
  for (const b of bookings) console.log('  ', b.id, b.serviceStart?.toISOString().slice(0,10), '→', b.serviceEnd?.toISOString().slice(0,10), '· courses:', b.courses?.map((c: any) => `${c.name}(${c.weeks}w)`).join(', '));

  // Attendance rows (the source of truth Profile pulls)
  const att: any[] = await prisma.attendance.findMany({
    where: { studentId: sid },
    select: { id: true, status: true, hours: true, occurrence: { select: { date: true, classId: true } } } as any,
    orderBy: { id: 'asc' },
  });
  console.log('\nattendance rows total:', att.length);
  for (const r of att.slice(-15)) {
    console.log('  ', r.occurrence?.date?.toISOString().slice(0,10), '·', r.status, '· class', r.occurrence?.classId);
  }

  // Activity attendees (Attended Social source)
  const aa: any[] = await (prisma as any).activityAttendee.findMany({
    where: { studentId: sid },
    include: { activity: { select: { id: true, title: true, date: true } } },
    orderBy: { id: 'asc' },
  });
  console.log('\nactivityAttendee rows:', aa.length);
  for (const r of aa) {
    console.log('  ', r.activity?.date?.toISOString().slice(0,10), '·', r.activity?.title, '· rsvp:', r.rsvp, '· attended:', r.attended);
  }

  // Activities feed window (next-30 + recent)
  const today = new Date(); today.setHours(0,0,0,0);
  const acts: any[] = await (prisma as any).activity.findMany({
    where: { date: { gte: new Date(today.getTime() - 7 * 86400000) } },
    select: { id: true, title: true, date: true } as any,
    orderBy: { date: 'asc' },
    take: 20,
  });
  console.log('\nupcoming activities (last 7d → forward):');
  for (const a of acts) console.log('  ', a.date?.toISOString().slice(0,10), '·', a.title, '(id', a.id, ')');

  // StudentClassAssignment (so we can see what class the student is in)
  const assigns: any[] = await (prisma as any).studentClassAssignment.findMany({
    where: { studentId: sid },
    include: { class_: { select: { id: true, level: true, session: true, name: true } } } as any,
    orderBy: { id: 'desc' },
  });
  console.log('\nclass assignments:', assigns.length);
  for (const a of assigns) console.log('  ', a.id, '· class', a.classId, '·', a.class_?.level, '/', a.class_?.session, a.class_?.name, '·', a.weekStart?.toISOString().slice(0,10), '→', a.weekEnd?.toISOString().slice(0,10));

  // Class occurrences for assigned class — does this class even have occurrences?
  for (const a of assigns) {
    if (!a.classId) continue;
    const wkStart = new Date(today); wkStart.setDate(wkStart.getDate() - 7);
    const wkEnd = new Date(today); wkEnd.setDate(wkEnd.getDate() + 7);
    const occs: any[] = await (prisma as any).classOccurrence.findMany({
      where: { classId: a.classId, date: { gte: wkStart, lte: wkEnd } },
      orderBy: { date: 'asc' },
      select: { id: true, date: true, classId: true } as any,
    });
    console.log(`\noccurrences for class ${a.classId} in ±7d of today:`);
    for (const o of occs) console.log('  ', o.id, '·', o.date?.toISOString().slice(0,10));
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
