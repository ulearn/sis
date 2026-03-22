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

    const [data, total] = await Promise.all([
      prisma.student.findMany({ where, skip, take: limit, orderBy: { lastName: 'asc' } }),
      prisma.student.count({ where }),
    ]);

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
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
    return prisma.student.delete({ where: { id } });
  }

  return { list, getById, create, update, remove };
}
