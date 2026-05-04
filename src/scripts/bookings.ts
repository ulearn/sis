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

  // ── Booking Holidays ────────────────────────
  // Inserting a holiday on a booking pushes BookingCourse.endDate (and
  // Booking.serviceEnd) forward by the number of WEEKDAYS in the holiday
  // window. Weekends don't extend the course because students only attend
  // Mon–Fri. Accommodation and extras are untouched per spec.

  function countWeekdays(start: Date, end: Date): number {
    // Inclusive range, Mon=1..Fri=5
    const s = new Date(start); s.setHours(0,0,0,0);
    const e = new Date(end); e.setHours(0,0,0,0);
    if (e < s) return 0;
    let days = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const d = cur.getDay();
      if (d >= 1 && d <= 5) days++;
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }

  function addWeekdays(date: Date, weekdays: number): Date {
    // Skip past weekends so the new end-date lands on a working day.
    const d = new Date(date); d.setHours(0,0,0,0);
    let added = 0;
    while (added < weekdays) {
      d.setDate(d.getDate() + 1);
      const dow = d.getDay();
      if (dow >= 1 && dow <= 5) added++;
    }
    return d;
  }

  function subWeekdays(date: Date, weekdays: number): Date {
    const d = new Date(date); d.setHours(0,0,0,0);
    let removed = 0;
    while (removed < weekdays) {
      d.setDate(d.getDate() - 1);
      const dow = d.getDay();
      if (dow >= 1 && dow <= 5) removed++;
    }
    return d;
  }

  // Effective push: number of holiday weekdays that fall ON OR BEFORE the
  // course endDate. Days after the original endDate are "free time" — they
  // don't extend the schedule. (Per spec: holidays after course end are a
  // natural gap requiring no action.)
  function effectiveWeekdays(holStart: Date, holEnd: Date, courseEnd: Date | null): number {
    if (!courseEnd) return 0;
    if (holStart > courseEnd) return 0;
    const cap = holEnd <= courseEnd ? holEnd : courseEnd;
    return countWeekdays(holStart, cap);
  }

  async function addHoliday(bookingId: number, data: Record<string, any>) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) throw new Error('Invalid dates');
    if (endDate < startDate) throw new Error('endDate cannot be before startDate');

    const totalWeekdays = countWeekdays(startDate, endDate);
    if (totalWeekdays === 0) throw new Error('Holiday range contains no weekdays');
    const weeks = Math.ceil(totalWeekdays / 5);

    return prisma.$transaction(async (tx) => {
      const courses = await tx.bookingCourse.findMany({
        where: { bookingId },
        select: { id: true, endDate: true },
      });

      // Compute effective push per course. Per the user's 35-week-per-course
      // rule, holidays only ever overlap one course at a time, so the values
      // converge to either 0 or the same N. We track the max for storage.
      let maxPush = 0;
      for (const c of courses) {
        const push = effectiveWeekdays(startDate, endDate, c.endDate);
        if (push > maxPush) maxPush = push;
        if (push > 0) {
          const newEnd = addWeekdays(c.endDate!, push);
          await tx.bookingCourse.update({ where: { id: c.id }, data: { endDate: newEnd } });
        }
      }

      // Mirror on the booking's serviceEnd
      if (maxPush > 0) {
        const booking = await tx.booking.findUnique({ where: { id: bookingId }, select: { serviceEnd: true } });
        if (booking?.serviceEnd) {
          const newServiceEnd = addWeekdays(booking.serviceEnd, maxPush);
          await tx.booking.update({ where: { id: bookingId }, data: { serviceEnd: newServiceEnd } });
        }
      }

      const holiday = await tx.bookingHoliday.create({
        data: {
          bookingId,
          startDate,
          endDate,
          weeks,
          type: data.type || 'student',
          weekdaysPushed: maxPush,
        } as any,
      });

      return { holiday, weekdaysPushed: maxPush, totalWeekdays };
    });
  }

  async function removeHoliday(holidayId: number) {
    const holiday = await prisma.bookingHoliday.findUnique({ where: { id: holidayId } });
    if (!holiday) throw new Error('Holiday not found');
    // Stored value first; fall back to recompute for legacy rows. Recompute
    // is conservative — it counts every weekday in the range, which matches
    // the old (pre-fix) behaviour.
    const weekdays = (holiday as any).weekdaysPushed ?? countWeekdays(holiday.startDate, holiday.endDate);

    return prisma.$transaction(async (tx) => {
      if (weekdays > 0) {
        const courses = await tx.bookingCourse.findMany({
          where: { bookingId: holiday.bookingId },
          select: { id: true, endDate: true },
        });
        for (const c of courses) {
          if (!c.endDate) continue;
          const newEnd = subWeekdays(c.endDate, weekdays);
          await tx.bookingCourse.update({ where: { id: c.id }, data: { endDate: newEnd } });
        }
        const booking = await tx.booking.findUnique({ where: { id: holiday.bookingId }, select: { serviceEnd: true } });
        if (booking?.serviceEnd) {
          const newServiceEnd = subWeekdays(booking.serviceEnd, weekdays);
          await tx.booking.update({ where: { id: holiday.bookingId }, data: { serviceEnd: newServiceEnd } });
        }
      }

      await tx.bookingHoliday.delete({ where: { id: holidayId } });
      return { deleted: true, weekdaysRolledBack: weekdays };
    });
  }

  async function listHolidays(bookingId: number) {
    return prisma.bookingHoliday.findMany({
      where: { bookingId },
      orderBy: { startDate: 'asc' },
    });
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
    addHoliday, removeHoliday, listHolidays,
  };
}
