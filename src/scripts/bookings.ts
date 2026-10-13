import { PrismaClient, BookingStatus } from '../generated/prisma/client';
import { autoFillIlepForStudent } from './ilep-deriver';
import { notifyDosOf121 } from './notify-121';

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

    // Date range filters match against COURSE start/end dates — not booking-level
    // serviceStart/serviceEnd, which Fidelo populates from "earliest of any
    // service" (often the accommodation check-in, which can be days before the
    // course starts). DOS users mean "course start" when they pick a date; the
    // booking-level field bled in students whose accom started in the window
    // but whose course did not (Odgerel/Quiñoa case, May 2026). Match if ANY
    // course on the booking starts/ends in range.
    if (query.startFrom || query.startTo) {
      const sd: any = {};
      if (query.startFrom) sd.gte = new Date(query.startFrom);
      if (query.startTo)   sd.lte = new Date(query.startTo);
      where.courses = { some: { startDate: sd } };
    }
    if (query.endFrom || query.endTo) {
      const ed: any = {};
      if (query.endFrom) ed.gte = new Date(query.endFrom);
      if (query.endTo)   ed.lte = new Date(query.endTo);
      // Prisma can only have one `courses` filter; merge with any startDate
      // condition above so both apply to the same `some` lookup.
      const existing = where.courses?.some || {};
      where.courses = { some: { ...existing, endDate: ed } };
    }

    if (search) {
      // A purely-numeric search is a precise ID lookup — match the booking id OR
      // the student id exactly (no name/email contains, which would bury the exact
      // hit under every email that happens to contain those digits). Non-numeric
      // searches stay name/email.
      if (/^\d+$/.test(search)) {
        const n = parseInt(search, 10);
        where.OR = [
          { id: n },
          { studentId: n },
        ];
      } else {
        where.student = {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        };
      }
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
          student: { select: { id: true, firstName: true, lastName: true, email: true, nationality: true, birthday: true, currentLevel: true, placementTestScore: true } },
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
        // Include matched bed → provider so the Accomm header can surface the
        // placed host (name, linked to the provider page) once matching is done.
        accommodations: {
          include: {
            bed: { include: { room: { include: { property: { include: { provider: true } } } } } },
          },
        },
        extras: true,
        holidays: true,
        payments: { orderBy: { paymentDate: 'desc' } },
        invoices: { include: { lineItems: true } },
        documents: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        // LifePass instalment ledger — only present on LifePass bookings.
        // Empty array on non-LifePass means the UI hides the panel.
        paymentInstalments: { orderBy: { sequence: 'asc' } },
        // Linked refund cases — surfaced in a "Refunds" card under Payments so a
        // Cancelled booking can be traced down to the refund detail. Empty ⇒ card
        // shows just the "Add Refund" action.
        refundRequests: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, status: true, refundReason: true, refundReasonOther: true, amountRequested: true, feeDeductionEur: true, amountRefunded: true, escrowHeld: true, createdAt: true },
        },
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

    // Track status change. Skip when there's no prior status (existing.status
    // is null) — e.g. hand-created "wrapper" bookings that never went through
    // the normal flow. There's no real transition to record a `fromStatus`
    // from, and from_status is a required enum, so writing null crashes the
    // insert and blocks the whole save.
    if (data.status && data.status !== existing.status && existing.status) {
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
    // Courses — need to clear class assignments first, plus the attendance
    // rows those assignments produced. Without the attendance sweep, deleting
    // a booking left orphan rows behind in the attendance table that still
    // counted toward the student's overall %.
    const booking = await prisma.booking.findUnique({ where: { id }, select: { studentId: true } });
    const courses = await prisma.bookingCourse.findMany({ where: { bookingId: id }, select: { id: true } });
    if (courses.length) {
      // Snapshot the (classId, weekStart, weekEnd) windows we're about to
      // tear down so we can scope the attendance delete precisely. Anything
      // outside these windows belongs to a different booking and stays put.
      const assignsToRemove = await prisma.studentClassAssignment.findMany({
        where: { bookingCourseId: { in: courses.map(c => c.id) } },
        select: { id: true, studentId: true, classId: true, weekStart: true, weekEnd: true },
      });
      await prisma.studentClassAssignment.deleteMany({ where: { bookingCourseId: { in: courses.map(c => c.id) } } });

      // For each removed window, drop attendance rows for that student in
      // that class — but only if no remaining assignment for the same student
      // and class still covers the date. That preserves rows from a parallel
      // booking on the same class (rare, but possible for re-bookings).
      for (const a of assignsToRemove) {
        if (!a.studentId || !a.classId) continue;
        const stillCovered = await prisma.studentClassAssignment.findFirst({
          where: {
            studentId: a.studentId,
            classId: a.classId,
            weekStart: { lte: a.weekEnd ?? new Date('2099-12-31') },
            OR: [{ weekEnd: null }, { weekEnd: { gte: a.weekStart } }],
          },
          select: { id: true },
        });
        if (stillCovered) continue;
        await prisma.attendance.deleteMany({
          where: {
            studentId: a.studentId,
            occurrence: {
              classId: a.classId,
              date: {
                gte: a.weekStart,
                ...(a.weekEnd ? { lte: a.weekEnd } : {}),
              },
            },
          },
        });
      }
    }
    // Absence reasons + cert files for this student that fall on dates this
    // booking covered. Tied to (studentId, date) without a booking FK, so we
    // sweep based on any course's date range. Same student-isolation rule.
    if (booking?.studentId) {
      for (const c of courses) {
        const bc = await prisma.bookingCourse.findUnique({ where: { id: c.id }, select: { startDate: true, endDate: true } });
        if (!bc?.startDate || !bc?.endDate) continue;
        const reasons = await prisma.absenceReason.findMany({
          where: { studentId: booking.studentId, date: { gte: bc.startDate, lte: bc.endDate } },
          select: { id: true },
        });
        if (reasons.length) {
          await prisma.absenceCertFile.deleteMany({ where: { absenceReasonId: { in: reasons.map(r => r.id) } } });
          await prisma.absenceReason.deleteMany({ where: { id: { in: reasons.map(r => r.id) } } });
        }
      }
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
    // 1-to-1 (PRIVATE) courses need a specially-rostered teacher — alert the DOS once.
    if ((created as any).category === 'PRIVATE') {
      notifyDosOf121(prisma, created.id).catch(e => console.error('[121-alert]', e?.message || e));
    }
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
    if (data.holidayWks !== undefined && data.holidayWks !== '' && data.holidayWks !== null) data.holidayWks = parseInt(data.holidayWks);
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    const updated = await prisma.bookingCourse.update({ where: { id }, data: data as any });
    const bc = await prisma.bookingCourse.findUnique({ where: { id }, select: { bookingId: true, booking: { select: { studentId: true } } } });
    const studentId = bc?.booking?.studentId;
    if (studentId) {
      try { await autoFillIlepForStudent(prisma, studentId); } catch (e) { console.error('autoFillIlep failed', e); }
    }
    // Living-document sync: the course date is the single source of truth for the
    // LoA visa window, so re-render any auto-tracking issued LoA for this booking
    // in place (portal copy + QR follow automatically). Best-effort.
    if (bc?.bookingId) {
      try {
        const { documentScripts } = await import('./documents');
        await documentScripts(prisma).syncLoaToBooking(bc.bookingId);
      } catch (e) { console.error('syncLoaToBooking failed', e); }
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

  // ── All weekday math is done in UTC ──────────────────────────────────────
  // Course/holiday dates are Prisma @db.Date (stored as UTC midnight). The
  // server runs in IST (UTC+1 in summer/BST), so using LOCAL methods
  // (setHours/getDay/setDate) rolls a UTC-midnight date back to 23:00 the prior
  // UTC day; the result then saves one calendar day early on any summer date.
  // UTC methods keep the arithmetic consistent with how the value is stored.
  function countWeekdays(start: Date, end: Date): number {
    // Inclusive range, Mon=1..Fri=5
    const s = new Date(start); s.setUTCHours(0,0,0,0);
    const e = new Date(end); e.setUTCHours(0,0,0,0);
    if (e < s) return 0;
    let days = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const d = cur.getUTCDay();
      if (d >= 1 && d <= 5) days++;
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return days;
  }

  function addWeekdays(date: Date, weekdays: number, isClosed?: (d: Date) => boolean): Date {
    // Skip weekends AND school-closure days (e.g. the Christmas closure) so a
    // holiday shunt extends by TEACHING days only. A closure day isn't a lost
    // class day, so it must NOT consume the extension — otherwise a shunt that
    // crosses Christmas lands ~2 weeks early (Issues 59/60). Neil, 2026-09-23.
    const d = new Date(date); d.setUTCHours(0,0,0,0);
    let added = 0;
    while (added < weekdays) {
      d.setUTCDate(d.getUTCDate() + 1);
      const dow = d.getUTCDay();
      if (dow >= 1 && dow <= 5 && !(isClosed && isClosed(d))) added++;
    }
    return d;
  }

  function subWeekdays(date: Date, weekdays: number, isClosed?: (d: Date) => boolean): Date {
    const d = new Date(date); d.setUTCHours(0,0,0,0);
    let removed = 0;
    while (removed < weekdays) {
      d.setUTCDate(d.getUTCDate() - 1);
      const dow = d.getUTCDay();
      if (dow >= 1 && dow <= 5 && !(isClosed && isClosed(d))) removed++;
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

    // ── Entitlement guards (spec: holidays apply only to non-EU Academic Year /
    // LifePass students; 10-week entitlement). Eligibility + the 10-week cap are
    // SOFT — they throw a ⚠ warning the staffer can override with force=true.
    // The 35-week visa ceiling further down is a HARD block (see there).
    {
      const bk = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { serviceStart: true, serviceEnd: true,
          student: { select: { nationality: true } },
          courses: { select: { name: true, startDate: true, endDate: true, isRenewal: true } } },
      });
      if (!bk) throw new Error('Booking not found');
      // HARD guard: a holiday shunts a COURSE end forward — a booking with no
      // course (e.g. an accommodation-only booking) has nothing to shunt, so a
      // holiday there is meaningless and corrupts records. Block it outright,
      // even with force. (Matheus #1046: his holidays had scrambled onto the
      // wrong booking; this stops course-less bookings ever holding a holiday.)
      if (!bk.courses.length) {
        throw new Error('This booking has no course — holidays can only be added to a booking with a course.');
      }
      const EU = new Set(['austria','belgium','bulgaria','croatia','cyprus','czechia','czech republic','denmark','estonia','finland','france','germany','greece','hungary','ireland','italy','latvia','lithuania','luxembourg','malta','netherlands','poland','portugal','romania','slovakia','slovenia','spain','sweden','iceland','liechtenstein','norway','switzerland']);
      const warnings: string[] = [];
      const nat = (bk.student?.nationality || '').trim();
      if (nat && EU.has(nat.toLowerCase())) warnings.push(`${nat} is an EU/EEA/Swiss nationality — holidays apply only to non-EU (visa) students.`);
      const isAYorLP = bk.courses.some(c => /academic year|life ?pass/i.test(c.name || '') || (c as any).isRenewal);
      if (!isAYorLP) warnings.push('This booking has no Academic Year / LifePass course — only those students may take holidays.');
      // Entitlement is 10 holiday weeks PER Academic Year course, not per
      // booking — a LifePass booking nests 3 AY courses, so measure against the
      // course this holiday falls in (its overlap), not the booking total.
      const isAYc = (c: any) => c.holidayWks != null || /academic year|life ?pass|renewal/i.test(c.name || '') || c.isRenewal;
      const hitCourse = bk.courses.find((c: any) => isAYc(c) && c.startDate && c.endDate && startDate <= new Date(c.endDate) && endDate >= new Date(c.startDate));
      if (hitCourse) {
        const existing = await prisma.bookingHoliday.findMany({ where: { bookingId }, select: { startDate: true, endDate: true, weeks: true } });
        const cs = +new Date(hitCourse.startDate!), ce = +new Date(hitCourse.endDate!);
        const inCourse = existing.filter(h => +new Date(h.startDate) <= ce && +new Date(h.endDate) >= cs);
        const existingWeeks = inCourse.reduce((s, h) => s + (h.weeks || 0), 0);
        if (existingWeeks + weeks > 10) warnings.push(`This brings this course's holidays to ${existingWeeks + weeks} weeks — the entitlement is 10 weeks per Academic Year.`);
        // ILEP timing (soft — staff may override): no wk 1–2, ≤6 in wk 3–25, ≤4 in wk 26–35.
        const { checkIlepAllowance } = await import('../lib/ilep-holiday');
        const ilep = checkIlepAllowance(new Date(hitCourse.startDate!), inCourse, startDate, weeks);
        if (!ilep.ok) warnings.push(ilep.error.replace(/\s*\(ILEP rule\)\.?$/, '') + ' (ILEP).');
      }

      // NOTE: the old hard 35-week visa ceiling (earliest AY start → latest
      // shunted end) is intentionally gone. It summed across a nested LifePass
      // booking's 3 courses (~105 weeks) and false-blocked every request. We now
      // treat each course as a separate 35-week component; the 10-week-per-course
      // allowance above is the real cap, enforced hard on the student self-service
      // path and a soft override for staff here.

      if (warnings.length && !data.force) {
        throw new Error('⚠ ' + warnings.join(' ') + ' — re-confirm to add anyway.');
      }
    }

    return prisma.$transaction(async (tx) => {
      const courses = await tx.bookingCourse.findMany({
        where: { bookingId },
        select: { id: true, startDate: true, endDate: true },
      });
      // School closures (Christmas etc.) — a holiday shunt must skip these so the
      // new course end lands on a real teaching day, not inside/before the closure.
      const closures = await tx.schoolClosure.findMany({ select: { startDate: true, endDate: true } });
      const isClosedDay = (d: Date) => closures.some(cl => d >= cl.startDate && d <= cl.endDate);

      // Shunt ONLY the course this holiday falls in — a mid-course holiday pushes
      // that course's end forward so the student keeps all 25 tuition weeks (a
      // holiday is a break FROM class, not lost class). Each nested LifePass
      // course is a separate component: a holiday in year 1 must NOT drag years
      // 2 & 3, so we require the holiday to overlap the course's own window
      // (start..end), not merely precede its end (the old rule shunted every
      // later course too).
      let maxPush = 0;
      for (const c of courses) {
        const overlaps = c.startDate && c.endDate && startDate <= c.endDate && endDate >= c.startDate;
        if (!overlaps) continue;
        const push = effectiveWeekdays(startDate, endDate, c.endDate);
        if (push > maxPush) maxPush = push;
        if (push > 0) {
          const newEnd = addWeekdays(c.endDate!, push, isClosedDay);
          await tx.bookingCourse.update({ where: { id: c.id }, data: { endDate: newEnd } });
        }
      }

      // Recompute serviceEnd = latest course end after the shunt (a year-1
      // holiday leaves serviceEnd — the year-3 end — unchanged).
      if (maxPush > 0) {
        const after = await tx.bookingCourse.findMany({ where: { bookingId }, select: { endDate: true } });
        const latest = after.map(c => c.endDate).filter(Boolean).map(d => +new Date(d!));
        if (latest.length) await tx.booking.update({ where: { id: bookingId }, data: { serviceEnd: new Date(Math.max(...latest)) } });
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
          select: { id: true, startDate: true, endDate: true },
        });
        const closures = await tx.schoolClosure.findMany({ select: { startDate: true, endDate: true } });
        const isClosedDay = (d: Date) => closures.some(cl => d >= cl.startDate && d <= cl.endDate);
        for (const c of courses) {
          if (!c.endDate) continue;
          // Roll back ONLY the course this holiday overlaps — mirrors addHoliday's
          // per-course shunt, so cancelling a nested LifePass year-1 holiday never
          // drags years 2 & 3 back.
          const overlaps = c.startDate && holiday.startDate <= c.endDate && holiday.endDate >= c.startDate;
          if (!overlaps) continue;
          const newEnd = subWeekdays(c.endDate, weekdays, isClosedDay);
          await tx.bookingCourse.update({ where: { id: c.id }, data: { endDate: newEnd } });
        }
        // Recompute serviceEnd = latest course end after the roll-back.
        const after = await tx.bookingCourse.findMany({ where: { bookingId: holiday.bookingId }, select: { endDate: true } });
        const latest = after.map(c => c.endDate).filter(Boolean).map(d => +new Date(d!));
        if (latest.length) await tx.booking.update({ where: { id: holiday.bookingId }, data: { serviceEnd: new Date(Math.max(...latest)) } });
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

  // ── Payments ────────────────────────────────
  // Auto-confirm a booking the moment its balance zeroes out. Mirrors the
  // display-only effStatus() in admin.html but WRITES it so the stored status
  // stops going stale (a fully-paid PENDING/PARTIAL booking used to show red on
  // the Students list forever). Upgrade-only: PENDING/PARTIAL → CONFIRMED on a
  // settled balance; never downgrades, never touches CANCELLED/ESCROW — so a
  // manual status override still stands. Called from every payment rollup point.
  // Neil 2026-07-08.
  function autoConfirmPatch(status: string | null | undefined, total: number | null, realPaid: number): { status?: string } {
    const EPS = 0.01;
    if ((status === 'PENDING' || status === 'PARTIAL') && total !== null && total > 0 && realPaid >= total - EPS) {
      return { status: 'CONFIRMED' };
    }
    return {};
  }

  // Manual payment entry (admin-only — guarded at the route layer). Stamps
  // dataSource=MANUAL so it's distinguishable from Fidelo/HubSpot imports
  // when reconciling. Recomputes booking.amountPaid + amountOpen as the
  // sum of non-escrow payment rows so the booking-header rollups stay
  // honest immediately (matches how the Fidelo importer thinks about it).
  async function addPayment(bookingId: number, body: Record<string, any>, paidBy: string | null) {
    const amount = Number(body.amount);
    if (!(amount > 0)) throw new Error('Amount must be positive');
    const dateStr = body.paymentDate;
    if (!dateStr) throw new Error('paymentDate required');

    const created = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        paymentDate: new Date(dateStr),
        method: body.method || null,
        type: body.type || null,
        receiptNumber: body.receiptNumber || null,
        comment: body.comment || null,
        paidBy: paidBy || null,
        dataSource: 'MANUAL',
      } as any,
    });

    // Roll up booking.amountPaid from non-escrow payment rows. Escrow shadow
    // rows (type='Escrow' OR method='TransferMate Escrow') intentionally don't
    // contribute — they represent money that hasn't actually settled to BoI.
    const allPayments = await prisma.payment.findMany({
      where: { bookingId },
      select: { amount: true, method: true, type: true },
    });
    const realPaid = allPayments.reduce((sum, p) => {
      const m = (p.method || '').toLowerCase();
      const t = (p.type || '').toLowerCase();
      const isEscrow = t === 'escrow' || m === 'transfermate escrow';
      return isEscrow ? sum : sum + Number(p.amount);
    }, 0);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { amountTotal: true, status: true },
    });
    const total = booking?.amountTotal ? Number(booking.amountTotal) : null;
    // Allow NEGATIVE balance (no Math.max clamp): an overpayment surfaces as a
    // minus rather than being hidden at 0. A negative is a signal — duplicate /
    // over-assigned payment — and does NOT block anything (the LoA gate keys on
    // balance > 0.01). Per Neil 2026-06-04: this is a display/signal layer that
    // must stay adaptive to payments.
    const open = total !== null ? total - realPaid : null;
    await prisma.booking.update({
      where: { id: bookingId },
      data: { amountPaid: realPaid, amountOpen: open, ...autoConfirmPatch(booking?.status, total, realPaid) } as any,
    });

    // NOTE: the credit-ledger draw-down for "ULearn Credit" is NOT done here.
    // It's owned by the invoice-paid webhook's reconcile (reconcileBookingCredit),
    // which detects the applied credit memo from the HubSpot invoice and posts the
    // store debit + stamps the "ULearn Credit" display payment row. Doing it here
    // too would double-count.
    return created;
  }

  // Delete a single payment row (Super-Admin-only — for duplicate clearing).
  // Re-rolls booking.amountPaid/amountOpen from the remaining non-escrow rows,
  // mirroring addPayment's rollup. Guarded so a paymentId can only be deleted
  // from the booking it actually belongs to.
  async function deletePayment(bookingId: number, paymentId: number) {
    const pay = await prisma.payment.findUnique({ where: { id: paymentId }, select: { bookingId: true } });
    if (!pay) throw new Error('Payment not found');
    if (pay.bookingId !== bookingId) throw new Error('Payment does not belong to this booking');
    await prisma.payment.delete({ where: { id: paymentId } });
    const allPayments = await prisma.payment.findMany({ where: { bookingId }, select: { amount: true, method: true, type: true } });
    const realPaid = allPayments.reduce((sum, p) => {
      const m = (p.method || '').toLowerCase(), t = (p.type || '').toLowerCase();
      const isEscrow = t === 'escrow' || m === 'transfermate escrow';
      return isEscrow ? sum : sum + Number(p.amount);
    }, 0);
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { amountTotal: true, status: true } });
    const total = booking?.amountTotal ? Number(booking.amountTotal) : null;
    // Allow NEGATIVE balance (no Math.max clamp): an overpayment surfaces as a
    // minus rather than being hidden at 0. A negative is a signal — duplicate /
    // over-assigned payment — and does NOT block anything (the LoA gate keys on
    // balance > 0.01). Per Neil 2026-06-04: this is a display/signal layer that
    // must stay adaptive to payments.
    const open = total !== null ? total - realPaid : null;
    // Deleting a payment only ever REDUCES realPaid, so this can only re-settle a
    // still-covered balance — it never spuriously confirms (autoConfirmPatch is
    // upgrade-only and gated on realPaid >= total).
    await prisma.booking.update({ where: { id: bookingId }, data: { amountPaid: realPaid, amountOpen: open, ...autoConfirmPatch(booking?.status, total, realPaid) } as any });
    return { deleted: true, amountPaid: realPaid, amountOpen: open };
  }

  // Edit a single payment (Super-Admin OR Accounts — gated at the route). Fixes
  // a mis-keyed amount / date / method / type without the delete-and-re-add
  // dance. Only the provided fields are touched. Re-rolls amountPaid/amountOpen
  // from non-escrow rows exactly like addPayment, so correcting an escrow row's
  // amount fixes the ledger figure WITHOUT changing received-revenue totals
  // (escrow shadow rows stay excluded from the rollup).
  async function updatePayment(bookingId: number, paymentId: number, body: Record<string, any>) {
    const pay = await prisma.payment.findUnique({ where: { id: paymentId }, select: { bookingId: true } });
    if (!pay) throw new Error('Payment not found');
    if (pay.bookingId !== bookingId) throw new Error('Payment does not belong to this booking');

    const data: Record<string, any> = {};
    if (body.amount !== undefined) {
      const amt = Number(body.amount);
      if (!(amt > 0)) throw new Error('Amount must be positive');
      data.amount = amt;
    }
    if (body.paymentDate !== undefined) {
      if (!body.paymentDate) throw new Error('paymentDate required');
      data.paymentDate = new Date(body.paymentDate);
    }
    if (body.method !== undefined) data.method = body.method || null;
    if (body.type !== undefined) data.type = body.type || null;
    if (body.receiptNumber !== undefined) data.receiptNumber = body.receiptNumber || null;
    if (body.comment !== undefined) data.comment = body.comment || null;
    if (Object.keys(data).length === 0) throw new Error('No fields to update');

    await prisma.payment.update({ where: { id: paymentId }, data });

    // Re-roll booking totals from non-escrow rows (mirrors addPayment/deletePayment).
    const allPayments = await prisma.payment.findMany({
      where: { bookingId },
      select: { amount: true, method: true, type: true },
    });
    const realPaid = allPayments.reduce((sum, p) => {
      const m = (p.method || '').toLowerCase();
      const t = (p.type || '').toLowerCase();
      const isEscrow = t === 'escrow' || m === 'transfermate escrow';
      return isEscrow ? sum : sum + Number(p.amount);
    }, 0);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { amountTotal: true, status: true },
    });
    const total = booking?.amountTotal ? Number(booking.amountTotal) : null;
    const open = total !== null ? total - realPaid : null;
    await prisma.booking.update({
      where: { id: bookingId },
      data: { amountPaid: realPaid, amountOpen: open, ...autoConfirmPatch(booking?.status, total, realPaid) } as any,
    });
    return { updated: true, amountPaid: realPaid, amountOpen: open };
  }

  // ── LifePass report ───────────────────────────────────────────────────
  // A LifePass booking is identified by having a PaymentInstalment ledger (the
  // 25 × €297 monthly drawdown against the master -Sub invoice). Onboard fee =
  // booking.amountTotal; the private "Total Balance" is what's still outstanding
  // on the -Sub (sum of unpaid, non-cancelled instalments — NOT published to the
  // customer). Overdue = unpaid instalments already past their due date.
  async function lifePassReport() {
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT b.id AS booking_id, s.id AS student_id,
             s.first_name, s.last_name, s.card_on_file, s.card_on_file_at,
             b.service_start, b.service_end,
             b.amount_total::float AS onboard_fee,
             b.amount_open::float  AS onboard_open,
             agg.total_seq, agg.paid, agg.overdue,
             agg.overdue_amt::float AS overdue_amt,
             agg.unpaid_amt::float  AS total_balance,
             agg.xero_inv
        FROM bookings b
        JOIN students s ON s.id = b.student_id
        JOIN (
          SELECT booking_id,
                 COUNT(*) FILTER (WHERE cancelled_at IS NULL)::int AS total_seq,
                 COUNT(*) FILTER (WHERE paid_at IS NOT NULL)::int AS paid,
                 COUNT(*) FILTER (WHERE paid_at IS NULL AND due_date < CURRENT_DATE AND cancelled_at IS NULL)::int AS overdue,
                 COALESCE(SUM(amount) FILTER (WHERE paid_at IS NULL AND due_date < CURRENT_DATE AND cancelled_at IS NULL), 0) AS overdue_amt,
                 COALESCE(SUM(amount) FILTER (WHERE paid_at IS NULL AND cancelled_at IS NULL), 0) AS unpaid_amt,
                 MIN(xero_invoice_number) AS xero_inv
            FROM payment_instalments
           GROUP BY booking_id
        ) agg ON agg.booking_id = b.id
       WHERE b.status IS DISTINCT FROM 'CANCELLED'   -- withdrawn LifePass bookings drop off the report
       ORDER BY agg.overdue DESC, s.first_name ASC`);
    return rows.map(r => ({
      bookingId: Number(r.booking_id),
      studentId: Number(r.student_id),
      name: `${r.first_name} ${r.last_name || ''}`.trim(),
      cardOnFile: !!r.card_on_file,
      cardOnFileAt: r.card_on_file_at || null,
      startDate: r.service_start || null,
      endDate: r.service_end || null,
      onboardFee: r.onboard_fee ?? null,
      onboardOpen: r.onboard_open ?? null,       // >0 → onboard fee not fully paid
      subsPaid: Number(r.paid || 0),
      subsTotal: Number(r.total_seq || 0),        // 25 for LifePass
      overdue: Number(r.overdue || 0),
      overdueBalance: r.overdue_amt ?? 0,
      totalBalance: r.total_balance ?? 0,         // private — remaining on the -Sub invoice
      xeroInvoice: r.xero_inv || null,
    }));
  }

  return {
    list, getById, create, update, remove,
    addCourse, updateCourse, removeCourse,
    addAccommodation, updateAccommodation, removeAccommodation,
    addExtra, updateExtra, removeExtra,
    addHoliday, removeHoliday, listHolidays,
    addPayment, updatePayment, deletePayment,
    lifePassReport,
  };
}
