import { PrismaClient } from '../generated/prisma/client';

const DATE_FIELDS = [
  'birthday', 'visaFrom', 'visaUntil', 'passportValidFrom', 'passportValidUntil'
];

function parseDates(data: Record<string, any>) {
  for (const field of DATE_FIELDS) {
    if (data[field] && typeof data[field] === 'string') {
      data[field] = new Date(data[field]);
    }
  }
  return data;
}

export function studentScripts(prisma: PrismaClient) {

  async function list(query: Record<string, any>) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, parseInt(query.limit) || 25);
    const skip = (page - 1) * limit;
    const search = query.search?.trim();

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { fideloCustomerNum: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (query.nationality) where.nationality = query.nationality;
    if (query.status) where.studentStatus = query.status;

    const [data, total, natRows] = await Promise.all([
      prisma.student.findMany({ where, skip, take: limit, orderBy: { lastName: 'asc' } }),
      prisma.student.count({ where }),
      prisma.student.findMany({ where: { nationality: { not: null } }, select: { nationality: true }, distinct: ['nationality'], orderBy: { nationality: 'asc' } }),
    ]);
    const nationalities = natRows.map(r => r.nationality).filter(Boolean) as string[];

    // Compute onboarding date = earliest start across all course/accom bookings per student
    const ids = data.map(s => s.id);
    if (ids.length) {
      const rows = await prisma.$queryRaw<{ student_id: number, onboarding_date: Date | null }[]>`
        SELECT b.student_id,
               LEAST(
                 MIN(bc.start_date),
                 MIN(ba.start_date)
               ) AS onboarding_date
        FROM bookings b
        LEFT JOIN booking_courses bc ON bc.booking_id = b.id
        LEFT JOIN booking_accommodations ba ON ba.booking_id = b.id
        WHERE b.student_id = ANY(${ids}::int[])
        GROUP BY b.student_id
      `;
      const byId = new Map(rows.map(r => [r.student_id, r.onboarding_date]));
      for (const s of data as any[]) s.onboardingDate = byId.get(s.id) || null;
    }

    return { data, total, page, limit, pages: Math.ceil(total / limit), nationalities };
  }

  async function getById(id: number) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            agency: true,
            courses: true,
            accommodations: true,
          },
          orderBy: { serviceStart: 'desc' },
        },
      },
    });
  }

  async function create(data: Record<string, any>) {
    parseDates(data);
    // Auto-set studentType from DOB if not explicitly provided
    if (!data.studentType && data.birthday) {
      const dob = new Date(data.birthday);
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      data.studentType = age < 16 ? 'JUNIOR' : 'ADULT';
    }
    if (data.groupId) data.groupId = parseInt(data.groupId);
    return prisma.student.create({ data: data as any });
  }

  async function update(id: number, data: Record<string, any>) {
    return prisma.student.update({ where: { id }, data: parseDates(data) as any });
  }

  async function remove(id: number) {
    // Cascade: delete child records first
    const bookings = await prisma.booking.findMany({ where: { studentId: id }, select: { id: true } });
    const bookingIds = bookings.map(b => b.id);
    if (bookingIds.length > 0) {
      await prisma.bookingStatusHistory.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.bookingHoliday.deleteMany({ where: { bookingId: { in: bookingIds } } });
      const courseIds = (await prisma.bookingCourse.findMany({ where: { bookingId: { in: bookingIds } }, select: { id: true } })).map(c => c.id);
      if (courseIds.length > 0) {
        await prisma.studentClassAssignment.deleteMany({ where: { bookingCourseId: { in: courseIds } } });
      }
      await prisma.bookingCourse.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.bookingAccommodation.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
    }
    await prisma.studentClassAssignment.deleteMany({ where: { studentId: id } });
    await prisma.attendance.deleteMany({ where: { studentId: id } });
    return prisma.student.delete({ where: { id } });
  }

  return { list, getById, create, update, remove };
}
