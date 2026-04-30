import { PrismaClient, BookingStatus } from '../generated/prisma/client';
import { autoFillIlepForStudent } from './ilep-deriver';

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

    // Date range filters on serviceStart and serviceEnd
    if (query.startFrom || query.startTo) {
      where.serviceStart = {};
      if (query.startFrom) where.serviceStart.gte = new Date(query.startFrom);
      if (query.startTo) where.serviceStart.lte = new Date(query.startTo);
    }
    if (query.endFrom || query.endTo) {
      where.serviceEnd = {};
      if (query.endFrom) where.serviceEnd.gte = new Date(query.endFrom);
      if (query.endTo) where.serviceEnd.lte = new Date(query.endTo);
    }

    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Sorting — default is createdAt desc. Supports student name, serviceStart, serviceEnd.
    let orderBy: any = { createdAt: 'desc' };
    const sortCol = query.sortBy;
    const sortDir = query.sortDir === 'asc' ? 'asc' : 'desc';
    if (sortCol === 'student') orderBy = { student: { firstName: sortDir } };
    else if (sortCol === 'start') orderBy = { serviceStart: sortDir };
    else if (sortCol === 'end') orderBy = { serviceEnd: sortDir };

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
        extras: true,
        holidays: true,
        payments: { orderBy: { paymentDate: 'desc' } },
        invoices: { include: { lineItems: true } },
        documents: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async function create(data: Record<string, any>) {
    const { courses, accommodations, extras, ...bookingData } = data;
    parseDates(bookingData, DATE_FIELDS);
    if (courses) courses.forEach((c: any) => parseDates(c, COURSE_DATE_FIELDS));
    if (accommodations) accommodations.forEach((a: any) => parseDates(a, ACCOM_DATE_FIELDS));
    if (extras) extras.forEach((e: any) => parseDates(e, ['scheduledAt']));

    return prisma.booking.create({
      data: {
        ...bookingData,
        statusHistory: bookingData.status ? {
          create: {
            fromStatus: bookingData.status,
            toStatus: bookingData.status,
          },
        } : undefined,
        courses: courses ? { create: courses } : undefined,
        accommodations: accommodations ? { create: accommodations } : undefined,
        extras: extras && extras.length ? { create: extras } : undefined,
      } as any,
      include: { student: true, courses: true, accommodations: true, extras: true },
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
          fromStatus: existing.status!,
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
    const created = await prisma.bookingCourse.create({ data: { bookingId, ...data } as any });
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { studentId: true } });
    if (booking?.studentId) {
      try { await autoFillIlepForStudent(prisma, booking.studentId); } catch (e) { console.error('autoFillIlep failed', e); }
    }
    return created;
  }

  async function updateCourse(id: number, data: Record<string, any>) {
    parseDates(data, COURSE_DATE_FIELDS);
    if (data.weeks) data.weeks = parseInt(data.weeks);
    if (data.hoursPerWeek) data.hoursPerWeek = parseFloat(data.hoursPerWeek);
    if (data.fee) data.fee = parseFloat(data.fee);
    if (data.discount) data.discount = parseFloat(data.discount);
    if (data.commission) data.commission = parseFloat(data.commission);
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    const updated = await prisma.bookingCourse.update({ where: { id }, data: data as any });
    const bc = await prisma.bookingCourse.findUnique({ where: { id }, select: { booking: { select: { studentId: true } } } });
    const studentId = bc?.booking?.studentId;
    if (studentId) {
      try { await autoFillIlepForStudent(prisma, studentId); } catch (e) { console.error('autoFillIlep failed', e); }
    }
    return updated;
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

  // ── Booking Extras ──────────────────────────
  async function addExtra(bookingId: number, data: Record<string, any>) {
    parseDates(data, ['scheduledAt']);
    if (data.fee !== undefined && data.fee !== null && data.fee !== '') data.fee = parseFloat(data.fee);
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.bookingExtra.create({ data: { bookingId, ...data } as any });
  }

  async function updateExtra(id: number, data: Record<string, any>) {
    parseDates(data, ['scheduledAt']);
    if (data.fee !== undefined && data.fee !== null && data.fee !== '') data.fee = parseFloat(data.fee);
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.bookingExtra.update({ where: { id }, data: data as any });
  }

  async function removeExtra(id: number) {
    return prisma.bookingExtra.delete({ where: { id } });
  }

  return {
    list, getById, create, update, remove,
    addCourse, updateCourse, removeCourse,
    addAccommodation, updateAccommodation, removeAccommodation,
    addExtra, updateExtra, removeExtra,
  };
}
