import { PrismaClient, BookingStatus } from '../generated/prisma/client';

const DATE_FIELDS = ['confirmedAt', 'checkinAt', 'checkoutAt', 'serviceStart', 'serviceEnd'];
const COURSE_DATE_FIELDS = ['startDate', 'endDate'];
const ACCOM_DATE_FIELDS = ['startDate', 'endDate'];

function parseDates(data: Record<string, any>, fields: string[]) {
  for (const field of fields) {
    if (data[field] && typeof data[field] === 'string') {
      data[field] = new Date(data[field]);
    }
  }
  return data;
}

export function bookingScripts(prisma: PrismaClient) {

  async function list(query: Record<string, any>) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, parseInt(query.limit) || 25);
    const skip = (page - 1) * limit;
    const search = query.search?.trim();

    const where: any = {};
    if (query.studentId) where.studentId = parseInt(query.studentId);
    if (query.status) where.status = query.status;
    if (query.agencyId) where.agencyId = parseInt(query.agencyId);

    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, email: true, nationality: true } },
          agency: { select: { id: true, name: true, nickname: true } },
          courses: true,
          accommodations: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async function getById(id: number) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        student: true,
        agency: true,
        courses: true,
        accommodations: true,
        holidays: true,
        payments: { orderBy: { paymentDate: 'desc' } },
        invoices: { include: { lineItems: true } },
        documents: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async function create(data: Record<string, any>) {
    const { courses, accommodations, ...bookingData } = data;
    parseDates(bookingData, DATE_FIELDS);
    if (courses) courses.forEach((c: any) => parseDates(c, COURSE_DATE_FIELDS));
    if (accommodations) accommodations.forEach((a: any) => parseDates(a, ACCOM_DATE_FIELDS));

    return prisma.booking.create({
      data: {
        ...bookingData,
        statusHistory: {
          create: {
            fromStatus: BookingStatus.ENQUIRY,
            toStatus: bookingData.status || BookingStatus.ENQUIRY,
          },
        },
        courses: courses ? { create: courses } : undefined,
        accommodations: accommodations ? { create: accommodations } : undefined,
      } as any,
      include: { student: true, courses: true, accommodations: true },
    });
  }

  async function update(id: number, data: Record<string, any>) {
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) return null;

    // Track status change
    if (data.status && data.status !== existing.status) {
      await prisma.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: existing.status,
          toStatus: data.status,
          changedBy: data._changedBy,
        },
      });
    }
    delete data._changedBy;
    parseDates(data, DATE_FIELDS);

    return prisma.booking.update({
      where: { id },
      data: data as any,
      include: { student: true, agency: true, courses: true, accommodations: true },
    });
  }

  async function remove(id: number) {
    // Cascade delete all related records
    await prisma.bookingStatusHistory.deleteMany({ where: { bookingId: id } });
    await prisma.bookingHoliday.deleteMany({ where: { bookingId: id } });
    await prisma.payment.deleteMany({ where: { bookingId: id } });
    // Courses — need to clear class assignments first
    const courses = await prisma.bookingCourse.findMany({ where: { bookingId: id }, select: { id: true } });
    if (courses.length) {
      await prisma.studentClassAssignment.deleteMany({ where: { bookingCourseId: { in: courses.map(c => c.id) } } });
    }
    await prisma.bookingCourse.deleteMany({ where: { bookingId: id } });
    await prisma.bookingAccommodation.deleteMany({ where: { bookingId: id } });
    // Documents & invoices
    const invoices = await prisma.invoice.findMany({ where: { bookingId: id }, select: { id: true } });
    if (invoices.length) {
      await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: { in: invoices.map(i => i.id) } } });
    }
    await prisma.invoice.deleteMany({ where: { bookingId: id } });
    const docRecords = await prisma.documentRecord.findMany({ where: { bookingId: id }, select: { id: true } });
    if (docRecords.length) {
      await prisma.documentDispatch.deleteMany({ where: { documentId: { in: docRecords.map(d => d.id) } } });
    }
    await prisma.documentRecord.deleteMany({ where: { bookingId: id } });
    await prisma.document.deleteMany({ where: { bookingId: id } });
    return prisma.booking.delete({ where: { id } });
  }

  // ── Booking Courses ─────────────────────────
  async function addCourse(bookingId: number, data: Record<string, any>) {
    parseDates(data, COURSE_DATE_FIELDS);
    if (data.weeks) data.weeks = parseInt(data.weeks);
    if (data.hoursPerWeek) data.hoursPerWeek = parseFloat(data.hoursPerWeek);
    if (data.fee) data.fee = parseFloat(data.fee);
    if (data.discount) data.discount = parseFloat(data.discount);
    if (data.commission) data.commission = parseFloat(data.commission);
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.bookingCourse.create({ data: { bookingId, ...data } as any });
  }

  async function updateCourse(id: number, data: Record<string, any>) {
    parseDates(data, COURSE_DATE_FIELDS);
    if (data.weeks) data.weeks = parseInt(data.weeks);
    if (data.hoursPerWeek) data.hoursPerWeek = parseFloat(data.hoursPerWeek);
    if (data.fee) data.fee = parseFloat(data.fee);
    if (data.discount) data.discount = parseFloat(data.discount);
    if (data.commission) data.commission = parseFloat(data.commission);
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.bookingCourse.update({ where: { id }, data: data as any });
  }

  async function removeCourse(id: number) {
    return prisma.bookingCourse.delete({ where: { id } });
  }

  // ── Booking Accommodation ───────────────────
  async function addAccommodation(bookingId: number, data: Record<string, any>) {
    parseDates(data, ACCOM_DATE_FIELDS);
    if (data.weeks) data.weeks = parseInt(data.weeks);
    if (data.fee) data.fee = parseFloat(data.fee);
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.bookingAccommodation.create({ data: { bookingId, ...data } as any });
  }

  async function updateAccommodation(id: number, data: Record<string, any>) {
    parseDates(data, ACCOM_DATE_FIELDS);
    if (data.weeks) data.weeks = parseInt(data.weeks);
    if (data.fee) data.fee = parseFloat(data.fee);
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.bookingAccommodation.update({ where: { id }, data: data as any });
  }

  async function removeAccommodation(id: number) {
    return prisma.bookingAccommodation.delete({ where: { id } });
  }

  return {
    list, getById, create, update, remove,
    addCourse, updateCourse, removeCourse,
    addAccommodation, updateAccommodation, removeAccommodation,
  };
}
