import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const p = new PrismaClient({ adapter } as any);

  const total = await (p as any).studentClassAssignment.count();
  const distinctStudents = await (p as any).studentClassAssignment.findMany({
    select: { studentId: true }, distinct: ['studentId'],
  });
  console.log(`Total StudentClassAssignment rows: ${total}`);
  console.log(`Distinct students assigned: ${distinctStudents.length}`);

  // Active bookings without assignments — who's affected besides Mélie?
  const today = new Date(); today.setHours(0,0,0,0);
  const activeBookings: any[] = await (p as any).booking.findMany({
    where: {
      serviceStart: { lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) }, // started or starting within 30 days
      OR: [
        { serviceEnd: null },
        { serviceEnd: { gte: today } },
      ],
      courses: { some: {} },
    },
    include: { student: true, courses: true },
    take: 50,
  });
  console.log(`\nActive bookings (started or starting within 30d, with courses): ${activeBookings.length}`);
  for (const b of activeBookings.slice(0, 15)) {
    const assigned = await (p as any).studentClassAssignment.count({ where: { studentId: b.studentId } });
    const cats = b.courses.map((c: any) => c.category).join(',');
    console.log(`  Booking ${b.id} ${b.student?.firstName} ${b.student?.lastName} (${cats})  serviceStart ${b.serviceStart?.toISOString().slice(0,10)}  assignments: ${assigned}`);
  }

  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
