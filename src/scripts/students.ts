import { PrismaClient, Prisma } from '../generated/prisma/client';
import { autoFillIlepForStudent } from './ilep-deriver';

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
    const offset = (page - 1) * limit;
    const search = (query.search || '').trim();
    const nationality = (query.nationality || '').trim();
    const status = (query.status || '').trim();

    // Whitelist sort columns — onboarded is the derived join column, the rest map directly.
    // Default to onboarded-desc so the most recent enrolments surface first.
    const SORTABLE = ['name', 'email', 'nationality', 'onboarded'];
    const sortBy = SORTABLE.includes(query.sortBy) ? query.sortBy : 'onboarded';
    const sortDirAsc = String(query.sortDir || '').toLowerCase() === 'asc';
    const dir = sortDirAsc ? Prisma.raw('ASC') : Prisma.raw('DESC');
    const orderClauses: Record<string, Prisma.Sql> = {
      name:        Prisma.sql`s.first_name ${dir}, s.last_name ${dir}, s.id DESC`,
      email:       Prisma.sql`s.email ${dir} NULLS LAST, s.id DESC`,
      nationality: Prisma.sql`s.nationality ${dir} NULLS LAST, s.last_name ASC`,
      onboarded:   Prisma.sql`ob.onboarding_date ${dir} NULLS LAST, s.id DESC`,
    };
    const orderBy = orderClauses[sortBy];

    // Build WHERE conditions as Prisma.sql fragments (parameterized).
    // Search is tokenised on whitespace: each token must match at least one
    // searchable column, and all tokens must match (AND across tokens). This
    // is what lets "Maria Agustina Quiñoa" match a row where firstName is
    // "Maria Agustina" and lastName is "Quiñoa" — no single column contains
    // the full phrase.
    //
    // `unaccent()` wraps both column and term so typed "Quinoa" matches
    // stored "Quiñoa" (and vice versa). Latin diacritics are normalised for
    // matching only — original characters stay in the DB (legal names).
    // Email and Fidelo customer-num don't carry diacritics, so we skip the
    // unaccent call on those.
    const conditions: Prisma.Sql[] = [];
    if (search) {
      const tokens = search.split(/\s+/).filter((t: string) => t.length > 0);
      for (const tok of tokens) {
        const term = `%${tok}%`;
        conditions.push(Prisma.sql`(
          unaccent(s.first_name) ILIKE unaccent(${term})
          OR unaccent(s.last_name) ILIKE unaccent(${term})
          OR s.email ILIKE ${term}
          OR s.fidelo_customer_num ILIKE ${term}
        )`);
      }
    }
    if (nationality) conditions.push(Prisma.sql`s.nationality = ${nationality}`);
    if (status) conditions.push(Prisma.sql`s.student_status = ${status}`);
    const whereSql = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

    // Inline subquery rather than CTE so the planner can use student_id index directly.
    const onboardingJoin = Prisma.sql`
      LEFT JOIN (
        SELECT b.student_id,
               LEAST(MIN(bc.start_date), MIN(ba.start_date)) AS onboarding_date
        FROM bookings b
        LEFT JOIN booking_courses bc ON bc.booking_id = b.id
        LEFT JOIN booking_accommodations ba ON ba.booking_id = b.id
        GROUP BY b.student_id
      ) ob ON ob.student_id = s.id
    `;

    const [idRows, countRows, natRows] = await Promise.all([
      prisma.$queryRaw<{ id: number; onboarding_date: Date | null }[]>`
        SELECT s.id, ob.onboarding_date
        FROM students s
        ${onboardingJoin}
        ${whereSql}
        ORDER BY ${orderBy}
        LIMIT ${limit} OFFSET ${offset}
      `,
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM students s
        ${whereSql}
      `,
      prisma.student.findMany({
        where: { nationality: { not: null } },
        select: { nationality: true },
        distinct: ['nationality'],
        orderBy: { nationality: 'asc' },
      }),
    ]);

    const total = Number(countRows[0]?.count || 0);
    const nationalities = natRows.map(r => r.nationality).filter(Boolean) as string[];
    const ids = idRows.map(r => r.id);

    // Load full Student records (for type-safe shape), then reorder per the sorted IDs.
    const records = ids.length ? await prisma.student.findMany({ where: { id: { in: ids } } }) : [];
    const byId = new Map(records.map(s => [s.id, s as any]));
    const onboardingById = new Map(idRows.map(r => [r.id, r.onboarding_date]));
    const data = ids.map(id => byId.get(id)).filter(Boolean);
    for (const s of data) s.onboardingDate = onboardingById.get(s.id) || null;

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      nationalities,
      sortBy,
      sortDir: sortDirAsc ? 'asc' : 'desc',
    };
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
    const levelTouched = Object.prototype.hasOwnProperty.call(data, 'currentLevel')
                      || Object.prototype.hasOwnProperty.call(data, 'nationality');
    // Single source of truth — same column powers Personal Details (admin +
    // student app) AND the Challenges/Ambassador flow. Strip the @ prefix on
    // the way in so admin entries stay consistent with the student-app input
    // (which already strips it).
    if ('instagramHandle' in data) {
      const h = (data.instagramHandle || '').toString().trim();
      data.instagramHandle = h ? h.replace(/^@/, '') : null;
    }
    const result = await prisma.student.update({ where: { id }, data: parseDates(data) as any });
    if (levelTouched) {
      try { await autoFillIlepForStudent(prisma, id); } catch (e) { console.error('autoFillIlep failed', e); }
    }
    return result;
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
