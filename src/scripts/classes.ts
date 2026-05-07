import { PrismaClient } from '../generated/prisma/client';

export function classScripts(prisma: PrismaClient) {

  // ── Classrooms ──────────────────────────────
  async function listClassrooms() {
    return prisma.classroom.findMany({ orderBy: { name: 'asc' } });
  }

  // ── Classes ─────────────────────────────────
  async function listClasses(query: Record<string, any>) {
    const where: any = {};
    if (query.session) where.session = query.session;
    if (query.level) where.level = query.level;
    if (query.active !== undefined) where.active = query.active === 'true';
    if (query.classroomId) where.classroomId = parseInt(query.classroomId);

    // Filter student assignments to the requested week (default: current week)
    // Use local-time parsing to avoid UTC timezone shift on DATE columns
    const weekOfStr = query.weekOf || new Date().toISOString().split('T')[0];
    const weekOf = new Date(weekOfStr + 'T12:00:00'); // noon local to avoid timezone edge
    const monday = new Date(weekOf);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    // Extend range by 1 day each side to handle Prisma DATE→DateTime timezone shift
    const rangeStart = new Date(monday);
    rangeStart.setDate(rangeStart.getDate() - 1);
    const rangeEnd = new Date(monday);
    rangeEnd.setDate(rangeEnd.getDate() + 5); // Saturday

    return prisma.class.findMany({
      where,
      include: {
        classroom: true,
        classTeachers: {
          where: {
            startDate: { lte: rangeEnd },
            OR: [{ endDate: null }, { endDate: { gte: rangeStart } }],
          },
          include: {
            teacher: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        studentAssignments: {
          where: {
            weekStart: { lte: rangeEnd },
            OR: [
              { weekEnd: null },
              { weekEnd: { gte: rangeStart } },
            ],
          },
          include: {
            student: { select: { id: true, firstName: true, lastName: true, currentLevel: true } },
            bookingCourse: {
              include: {
                booking: {
                  include: {
                    student: { select: { id: true, firstName: true, lastName: true, currentLevel: true } },
                    // Holidays needed by the frontend so the class roster can mark students
                    // as 🏖️ on-holiday during their absence window. Only those overlapping
                    // the requested week range are loaded — keeps payload small.
                    holidays: {
                      where: {
                        startDate: { lte: rangeEnd },
                        endDate: { gte: rangeStart },
                      },
                    },
                  }
                }
              }
            }
          }
        },
      },
      orderBy: [{ session: 'asc' }, { level: 'asc' }],
    });
  }

  async function getClassById(id: number) {
    return prisma.class.findUnique({
      where: { id },
      include: {
        classroom: true,
        studentAssignments: {
          include: {
            student: true,
            bookingCourse: {
              include: {
                booking: {
                  include: { student: true, holidays: true }
                }
              }
            }
          },
          orderBy: { weekStart: 'asc' },
        },
        occurrences: {
          include: {
            teacherAssignments: { include: { teacher: true } },
            attendanceRecords: true,
          },
          orderBy: { date: 'desc' },
          take: 20,
        },
      },
    });
  }

  function coerceClassFields(data: Record<string, any>) {
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    if (data.breakMinutes != null) data.breakMinutes = parseInt(data.breakMinutes);
    if (data.classroomId != null) data.classroomId = parseInt(data.classroomId);
    if (Array.isArray(data.days)) data.days = data.days.map((d: any) => parseInt(d));
    return data;
  }

  async function createClass(data: Record<string, any>) {
    coerceClassFields(data);
    const cls = await prisma.class.create({
      data: data as any,
      include: { classroom: true },
    });
    // Materialise occurrences for the new class (next 8 weeks)
    try {
      const { schedulingScripts } = await import('./scheduling');
      await schedulingScripts(prisma).regenerateForClass(cls.id);
    } catch (e) { console.error('regenerateForClass failed:', e); }
    return cls;
  }

  async function updateClass(id: number, data: Record<string, any>) {
    coerceClassFields(data);
    const cls = await prisma.class.update({
      where: { id },
      data: data as any,
      include: { classroom: true },
    });
    // Regenerate: days/times may have changed
    try {
      const { schedulingScripts } = await import('./scheduling');
      await schedulingScripts(prisma).regenerateForClass(cls.id);
    } catch (e) { console.error('regenerateForClass failed:', e); }
    return cls;
  }

  async function deleteClass(id: number) {
    return prisma.class.delete({ where: { id } });
  }

  // ── Student ↔ Class assignments ─────────────
  async function assignStudent(data: { bookingCourseId: number; classId: number; weekStart: string; weekEnd?: string }, callerRole?: string) {
    // Resolve studentId from booking_course -> booking and denormalize at write time.
    // Both booking_course_id (provenance) and student_id (query convenience) need to
    // be populated: historic rows had only student_id, UI-created rows previously had
    // only booking_course_id. Downstream consumers (LMS feedback auth, attendance,
    // reporting) join on student_id and were silently missing the new rows.
    //
    // Always default weekEnd to the booking course's end_date if the caller didn't
    // supply one — without this, private/121 enrolments "sit forever" and the engine
    // generates phantom occurrences past the student's actual course end. This is
    // the root-cause fix for the "Wanyu still in 121 weeks after her course ended"
    // class of bug.
    const bc = await prisma.bookingCourse.findUnique({
      where: { id: data.bookingCourseId },
      select: {
        startDate: true, endDate: true,
        booking: { select: { studentId: true, amountPaid: true, amountTotal: true } },
      },
    });
    const studentId = bc?.booking?.studentId ?? null;
    const fallbackEnd = bc?.endDate ?? null;
    const weekEnd = data.weekEnd ? new Date(data.weekEnd) : fallbackEnd;
    // Clamp weekStart to the booking course's startDate. Prevents the
    // "Adriana shows up in B2 from 02 Mar even though her course starts
    // 27 Apr" failure mode — that happened because callers were passing the
    // booking serviceStart (Mar 1) rather than the course startDate (Apr 27)
    // and nothing here checked. We clamp instead of throwing because the
    // request is valid, just dated too early.
    const requestedStart = new Date(data.weekStart);
    const courseStart = bc?.startDate ?? null;
    const weekStart = (courseStart && requestedStart < courseStart) ? courseStart : requestedStart;

    // Payment-status gate (matches the accommodation matching engine semantics).
    // Zero-paid bookings shouldn't even reach this endpoint via the UI, but the
    // belt-and-braces server check here closes the URL-direct hole.  Partial-
    // paid bookings can still be assigned, but only by an admin or DOS — every
    // other role sees an explanatory error so they escalate.
    const paid  = Number(bc?.booking?.amountPaid  || 0);
    const total = Number(bc?.booking?.amountTotal || 0);
    if (paid <= 0) {
      throw new Error('Cannot assign: no payment has been received on this booking.');
    }
    const partial = total > 0 && (total - paid) > 0.01;
    if (partial && callerRole !== 'admin' && callerRole !== 'dos') {
      throw new Error('Cannot assign: outstanding balance on this booking. Escalate to admin or DOS.');
    }

    const created = await prisma.studentClassAssignment.create({
      data: {
        bookingCourseId: data.bookingCourseId,
        studentId,
        classId: data.classId,
        weekStart,
        weekEnd,
      } as any,
    });

    // Trigger occurrence regeneration so the new enrolment's days are materialised,
    // and cleanup any phantom occurrences left over from prior schedule states
    // (relevant for private classes whose occurrences are now gated on enrolment).
    try {
      const { schedulingScripts } = await import('./scheduling');
      const sched = schedulingScripts(prisma);
      await sched.regenerateForClass(data.classId);
      await sched.cleanupPrivateClassOccurrences(data.classId);
    } catch (e) { console.error('schedule sync after assignStudent failed:', e); }

    return created;
  }

  /**
   * Clip a student's enrolment so they're removed from `weekStart` onward but kept
   * in earlier weeks. This is what staff actually mean by "remove from this week" —
   * a hard DELETE wipes them from past weeks too, which is a foot-gun (Paul's bug).
   * Sets weekEnd = (weekStart - 1 day). If weekStart is before the existing
   * weekStart, the assignment is fully deleted (clipping to an empty range).
   */
  async function endAssignment(id: number, weekStart: string) {
    const existing = await prisma.studentClassAssignment.findUnique({ where: { id } });
    if (!existing) return { clipped: false };
    const clipDate = new Date(weekStart);
    clipDate.setDate(clipDate.getDate() - 1); // previous Sunday
    if (clipDate < new Date(existing.weekStart)) {
      await prisma.studentClassAssignment.delete({ where: { id } });
    } else {
      await prisma.studentClassAssignment.update({
        where: { id },
        data: { weekEnd: clipDate },
      });
    }
    // Cleanup orphaned occurrences in the now-uncovered window.
    try {
      const { schedulingScripts } = await import('./scheduling');
      await schedulingScripts(prisma).cleanupPrivateClassOccurrences(existing.classId);
    } catch (e) { console.error('cleanup after endAssignment failed:', e); }

    return clipDate < new Date(existing.weekStart)
      ? { clipped: false, deleted: true }
      : { clipped: true, weekEnd: clipDate };
  }

  async function removeAssignment(id: number) {
    const existing = await prisma.studentClassAssignment.findUnique({ where: { id } });
    const result = await prisma.studentClassAssignment.delete({ where: { id } });
    if (existing) {
      try {
        const { schedulingScripts } = await import('./scheduling');
        await schedulingScripts(prisma).cleanupPrivateClassOccurrences(existing.classId);
      } catch (e) { console.error('cleanup after removeAssignment failed:', e); }
    }
    return result;
  }

  // ── Unassigned students (booking courses not in any class) ──
  // Date scoping: explicit `from`/`to` query params override the default week window.
  // If neither is supplied and `weekOf` is, falls back to that week. If `from` and
  // `to` are both omitted (and no weekOf), returns the full pool for the session.
  async function unassignedStudents(query: Record<string, any>) {
    const session = query.session; // MORNING or AFTERNOON
    const weekOf = query.weekOf;  // date string e.g. "2025-03-17"
    const fromStr = query.from;
    const toStr = query.to;

    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = null;

    if (fromStr || toStr) {
      if (fromStr) rangeStart = new Date(fromStr + 'T00:00:00');
      if (toStr)   rangeEnd   = new Date(toStr   + 'T23:59:59');
    } else if (weekOf) {
      const weekStart = new Date(weekOf + 'T12:00:00');
      const monday = new Date(weekStart);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      rangeStart = monday;
      rangeEnd = new Date(monday);
      rangeEnd.setDate(rangeEnd.getDate() + 6);
    }
    // else: both null → unbounded, return everything matching session+payment

    // Find all active booking courses whose dates overlap the range.
    // PRIVATE is included in every session — frontend filters to 121/private classes.
    const sessionCategories: string[] = [];
    if (session === 'MORNING') sessionCategories.push('MORNING', 'MORNING_PLUS', 'INTENSIVE', 'PRIVATE');
    else if (session === 'AFTERNOON') sessionCategories.push('AFTERNOON', 'AFTERNOON_PLUS', 'INTENSIVE', 'PRIVATE');
    else sessionCategories.push('MORNING', 'MORNING_PLUS', 'AFTERNOON', 'AFTERNOON_PLUS', 'INTENSIVE', 'PRIVATE', 'OTHER');

    const dateWhere: any = {};
    if (rangeStart) dateWhere.endDate = { gte: rangeStart };
    if (rangeEnd)   dateWhere.startDate = { lte: rangeEnd };

    const bookingCourses = await prisma.bookingCourse.findMany({
      where: {
        active: true,
        category: { in: sessionCategories as any },
        ...dateWhere,
        // Hide unpaid bookings outright — the staff directive is "if they
        // haven't paid anything, don't even surface them for assignment".
        // Partial-paid bookings (paid > 0 but not in full) are still surfaced
        // here and tagged below so the UI can render an orange warning + lock
        // for non-admin staff. (Mirrors getUnplacedStudents in accommodation.)
        booking: { amountPaid: { gt: 0 }, status: { notIn: ['ESCROW', 'CANCELLED'] } },
      },
      include: {
        booking: {
          include: { student: { select: { id: true, firstName: true, lastName: true, currentLevel: true, nationality: true } } }
        },
        classAssignments: rangeStart || rangeEnd ? {
          where: {
            ...(rangeEnd   ? { weekStart: { lte: rangeEnd } } : {}),
            ...(rangeStart ? { OR: [{ weekEnd: null }, { weekEnd: { gte: rangeStart } }] } : {}),
          },
        } : true,
      },
    });

    // Tag payment status so the UI can paint partial-paid rows orange and
    // gate the assign action for non-admin staff. We deliberately don't lean
    // on `amountOpen` because it's a derived field that's been observed to
    // lag behind paid/total in the Fidelo import — same reasoning as the
    // accommodation matching engine. EPS=€0.01 wiggle for cent rounding.
    const EPS = 0.01;
    const tagged = bookingCourses.map((bc: any) => {
      const paid  = Number(bc.booking?.amountPaid  || 0);
      const total = Number(bc.booking?.amountTotal || 0);
      let paymentStatus: 'paid' | 'partial' = 'paid';
      let paymentBalance = 0;
      if (total > 0 && (total - paid) > EPS) {
        paymentStatus = 'partial';
        paymentBalance = total - paid;
      }
      return { ...bc, paymentStatus, paymentBalance };
    });

    // When a range is bound, filter to bookings with no overlapping assignment in that range.
    // When unbounded, return all (caller filters client-side per class context).
    if (rangeStart || rangeEnd) {
      return tagged.filter((bc: any) => bc.classAssignments.length === 0);
    }
    return tagged;
  }

  // ── Class teachers (default assignment) ─────
  // Returns one row per (teacher) for currently-open assignments — drops historical/closed
  // and deduplicates legacy data where multiple open rows exist for the same pairing.
  async function getClassTeachers(classId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rows = await prisma.classTeacher.findMany({
      where: {
        classId,
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      include: { teacher: true },
      orderBy: { startDate: 'asc' }, // earliest first — that's the "real" assignment
    });
    const seen = new Set<number>();
    return rows.filter(r => {
      if (seen.has(r.teacherId)) return false;
      seen.add(r.teacherId);
      return true;
    });
  }

  async function assignClassTeacher(data: Record<string, any>) {
    const classId = parseInt(data.classId);
    const teacherId = parseInt(data.teacherId);
    const startDate = new Date(data.startDate);
    const endDate = data.endDate ? new Date(data.endDate) : null;
    // Close any existing open assignment for the same (teacher, class) so we never accumulate dupes
    await prisma.classTeacher.updateMany({
      where: { classId, teacherId, endDate: null },
      data: { endDate: new Date(startDate.getTime() - 86400000) }, // end the day before the new start
    });
    return prisma.classTeacher.create({
      data: { classId, teacherId, startDate, endDate } as any,
      include: { teacher: true },
    });
  }

  async function removeClassTeacher(id: number) {
    return prisma.classTeacher.delete({ where: { id } });
  }

  // ── Teacher covers (exceptions) ───────────
  async function getCovers(query: Record<string, any>) {
    const where: any = {};
    if (query.classId) where.classId = parseInt(query.classId);
    if (query.date) where.date = new Date(query.date);
    return prisma.teacherCover.findMany({
      where,
      include: { originalTeacher: true, coverTeacher: true, class_: true },
      orderBy: { date: 'desc' },
    });
  }

  async function createCover(data: Record<string, any>) {
    return prisma.teacherCover.create({
      data: {
        classId: parseInt(data.classId),
        date: new Date(data.date),
        originalTeacherId: parseInt(data.originalTeacherId),
        coverTeacherId: parseInt(data.coverTeacherId),
        startTime: data.startTime,
        endTime: data.endTime,
        reason: data.reason || null,
      } as any,
      include: { originalTeacher: true, coverTeacher: true },
    });
  }

  async function removeCover(id: number) {
    return prisma.teacherCover.delete({ where: { id } });
  }

  // Cover Dashboard — month-anchored view of:
  //  (a) Forecast: who is on Zoho leave each week of the month (Mon–Fri grid)
  //  (b) Actuals: cover assignments already made in the month (cost / absorbed)
  // Salaried teachers (DOS) are surfaced separately so management can compare
  // DOS-absorbed cover against the regulatory weekly cap of 15h.
  async function coverDashboard(query: Record<string, any>) {
    const today = new Date();
    let year: number, month: number;
    if (query.month) {
      const [y, m] = String(query.month).split('-').map(Number);
      year = y; month = m;
    } else {
      year = today.getFullYear();
      month = today.getMonth() + 1;
    }
    const localIso = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;

    // Prefer payroll-period boundaries (e.g. Mar = Feb 26 → Mar 25). Fall back to
    // calendar month if no period is configured for the requested year/month.
    const payrollPeriod = await prisma.payrollPeriod.findFirst({ where: { period: month, year } });
    const monthStart = payrollPeriod ? new Date(payrollPeriod.dateFrom) : new Date(year, month - 1, 1);
    const monthEnd = payrollPeriod ? new Date(payrollPeriod.dateTo) : new Date(year, month, 0);
    monthStart.setHours(0,0,0,0);
    monthEnd.setHours(23,59,59,999);
    const monthStartIso = localIso(monthStart);
    const monthEndIso = localIso(monthEnd);
    const monthLabel = new Date(year, month - 1, 1).toLocaleString('en-IE', { month: 'long', year: 'numeric' });

    // Mon–Fri grid covering every weekday inside the period. Weeks may be
    // partial at the start or end (e.g. period starts Thu) — partial cells
    // outside the period are flagged so the UI can dim them.
    const firstMon = (() => {
      const d = new Date(monthStart);
      const dow = d.getDay();
      d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
      return d;
    })();
    type DayCell = { date: string; dom: number; inPeriod: boolean };
    type Week = { idx: number; mondayDate: Date; days: DayCell[] };
    const weeks: Week[] = [];
    {
      let i = 0;
      let cur = new Date(firstMon);
      while (cur <= monthEnd) {
        const days: DayCell[] = [];
        let weekHasInPeriodDay = false;
        for (let k = 0; k < 5; k++) {
          const d = new Date(cur); d.setDate(d.getDate() + k);
          const inPeriod = d >= monthStart && d <= monthEnd;
          if (inPeriod) weekHasInPeriodDay = true;
          days.push({ date: localIso(d), dom: d.getDate(), inPeriod });
        }
        if (weekHasInPeriodDay) {
          i++;
          weeks.push({ idx: i, mondayDate: new Date(cur), days });
        }
        cur.setDate(cur.getDate() + 7);
      }
    }

    const spanFrom = weeks[0].days[0].date;
    const spanTo = weeks[weeks.length - 1].days[4].date;
    const spanFromDate = new Date(weeks[0].mondayDate);
    const spanToDate = new Date(weeks[weeks.length - 1].mondayDate);
    spanToDate.setDate(spanToDate.getDate() + 4);
    spanToDate.setHours(23,59,59,999);

    const teachers = await prisma.teacher.findMany({ where: { active: true } });
    const teacherMap = new Map(teachers.map(t => [t.id, t]));

    // ── Covers in span ────────────
    const covers = await prisma.teacherCover.findMany({
      where: { date: { gte: spanFromDate, lte: spanToDate } },
      include: { coverTeacher: true, originalTeacher: true, class_: true },
      orderBy: { date: 'asc' },
    });
    const calcHours = (s: string, e: string) => {
      const [sh,sm] = s.split(':').map(Number);
      const [eh,em] = e.split(':').map(Number);
      return Math.max(0, (eh*60+em - sh*60-sm) / 60);
    };

    type Bucket = { teacherId: number; name: string; isSalaried: boolean; hourlyRate: number; coverCount: number; coverHours: number };
    const monthByTeacher: Record<number, Bucket> = {};

    // (originalTeacherId, dateIso) → coverer name. If a teacher has multiple
    // covers on one day (AM + PM blocks), join with " + ".
    const coverByOriginal: Record<string, { name: string; isSalaried: boolean }> = {};

    for (const c of covers) {
      const hrs = calcHours(c.startTime, c.endTime);
      const dIso = localIso(c.date);
      if (dIso < monthStartIso || dIso > monthEndIso) continue;
      const tCoverer = teacherMap.get(c.coverTeacherId);
      const isSalaried = !!tCoverer?.isSalaried;

      // Cover overlay key (last name only — the cell is tight).
      const coverLast = `${c.coverTeacher.lastName}`;
      const k = `${c.originalTeacherId}|${dIso}`;
      if (!coverByOriginal[k]) {
        coverByOriginal[k] = { name: coverLast, isSalaried };
      } else if (!coverByOriginal[k].name.includes(coverLast)) {
        coverByOriginal[k].name += ' + ' + coverLast;
        coverByOriginal[k].isSalaried = coverByOriginal[k].isSalaried || isSalaried;
      }

      // Aggregate for stat cards.
      if (!monthByTeacher[c.coverTeacherId]) {
        monthByTeacher[c.coverTeacherId] = {
          teacherId: c.coverTeacherId,
          name: `${tCoverer?.firstName ?? c.coverTeacher.firstName} ${tCoverer?.lastName ?? c.coverTeacher.lastName}`,
          isSalaried,
          hourlyRate: Number(tCoverer?.hourlyRate ?? 0),
          coverCount: 0, coverHours: 0,
        };
      }
      monthByTeacher[c.coverTeacherId].coverCount++;
      monthByTeacher[c.coverTeacherId].coverHours += hrs;
    }

    // ── Zoho leave overlay ────
    const ZohoLeaveSync = require('./zoho-leave-sync');
    const sync = new ZohoLeaveSync({});
    type LeaveCell = { hours: number; coveredBy: string | null; coverHasSalaried: boolean };
    type LeaveRow = { teacherId: number; name: string; isSalaried: boolean; daily: Record<string, LeaveCell>; total: number };
    const leaveByTeacher: Record<number, Record<string, number>> = {};
    let zohoOk = true;
    try {
      await Promise.all(teachers
        .filter(t => t.email)
        .map(async (t) => {
          try {
            const emp = await sync.getEmployeeByEmail(t.email!);
            if (!emp) return;
            const breakdown = await sync.getDailyLeaveBreakdown(emp.employeeId, spanFrom, spanTo);
            const map: Record<string, number> = {};
            for (const [date, info] of Object.entries(breakdown)) {
              map[date] = +Number((info as any).hours).toFixed(2);
            }
            leaveByTeacher[t.id] = map;
          } catch (e) {
            zohoOk = false;
            console.warn(`[cover-dashboard] leave fetch failed for teacher ${t.id}:`, (e as any)?.message);
          }
        }));
    } catch (e) {
      zohoOk = false;
    }

    // Per-week leave rows: only teachers with leave hours in that week.
    const weekViews = weeks.map(w => {
      const rowsRaw: LeaveRow[] = [];
      const dailyTotals: Record<string, number> = Object.fromEntries(w.days.map(d => [d.date, 0]));
      for (const t of teachers) {
        const map = leaveByTeacher[t.id];
        if (!map) continue;
        const daily: Record<string, LeaveCell> = {};
        let total = 0;
        for (const dCell of w.days) {
          const h = map[dCell.date] || 0;
          if (h > 0 && dCell.inPeriod) {
            const cov = coverByOriginal[`${t.id}|${dCell.date}`];
            daily[dCell.date] = { hours: h, coveredBy: cov ? cov.name : null, coverHasSalaried: !!cov?.isSalaried };
            total += h;
            dailyTotals[dCell.date] += h;
          }
        }
        if (total > 0) {
          rowsRaw.push({
            teacherId: t.id,
            name: `${t.firstName} ${t.lastName}`,
            isSalaried: !!t.isSalaried,
            daily,
            total: +total.toFixed(2),
          });
        }
      }
      rowsRaw.sort((a, b) => b.total - a.total);
      const weekTotal = +Object.values(dailyTotals).reduce((s, x) => s + x, 0).toFixed(2);
      return {
        idx: w.idx,
        weekStart: w.days[0].date,
        days: w.days,
        leaveRows: rowsRaw,
        dailyTotals: Object.fromEntries(Object.entries(dailyTotals).map(([k,v]) => [k, +v.toFixed(2)])),
        weekTotal,
      };
    });

    // ── Totals (for the top stat strip) ──────────
    const allBuckets = Object.values(monthByTeacher);
    const avgHourly = (() => {
      const hs = teachers.filter(t => !t.isSalaried && t.hourlyRate).map(t => Number(t.hourlyRate));
      return hs.length ? hs.reduce((a, b) => a + b, 0) / hs.length : 22;
    })();
    const coverHours = allBuckets.reduce((s, r) => s + r.coverHours, 0);
    const salHours = allBuckets.filter(r => r.isSalaried).reduce((s, r) => s + r.coverHours, 0);
    const billedCost = allBuckets.filter(r => !r.isSalaried).reduce((s, r) => s + r.coverHours * r.hourlyRate, 0);
    const monthTotals = {
      coverHours: +coverHours.toFixed(2),
      salariedHours: +salHours.toFixed(2),
      hourlyHours: +(coverHours - salHours).toFixed(2),
      salariedPct: coverHours > 0 ? +(salHours / coverHours * 100).toFixed(1) : 0,
      billedCostEur: +billedCost.toFixed(2),
      absorbedSavingEur: +(salHours * avgHourly).toFixed(2),
      avgHourlyRate: +avgHourly.toFixed(2),
      teacherCount: allBuckets.length,
    };

    return {
      month: { year, month, label: monthLabel, from: monthStartIso, to: monthEndIso, weekCount: weeks.length, isPayrollPeriod: !!payrollPeriod },
      weeks: weekViews,
      monthTotals,
      zohoOk,
    };
  }

  // ── Teachers ────────────────────────────────
  // `active` is the manual on-roster flag. effectiveActive = active !== false.
  // currentlyTeaching is a separate display indicator (assigned to a live class OR salaried).
  async function listTeachers(query: Record<string, any> = {}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rows = await prisma.teacher.findMany({
      orderBy: { lastName: 'asc' },
      include: {
        classTeachers: {
          where: {
            OR: [{ endDate: null }, { endDate: { gte: today } }],
            class_: { active: true },
          },
          select: { classId: true },
        },
      },
    });
    const enriched = rows.map(t => {
      const currentClassCount = new Set((t.classTeachers || []).map(ct => ct.classId)).size;
      const effectiveActive = t.active !== false;
      const currentlyTeaching = currentClassCount > 0 || t.isSalaried === true;
      const { classTeachers, ...rest } = t;
      return { ...rest, currentClassCount, effectiveActive, currentlyTeaching };
    });
    if (query.active === 'all')   return enriched;
    if (query.active === 'false') return enriched.filter(t => !t.effectiveActive);
    // Default (no param or 'true'): on-roster teachers (the assignable pool)
    return enriched.filter(t => t.effectiveActive);
  }

  async function getTeacherById(id: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const t = await prisma.teacher.findUnique({
      where: { id },
      include: {
        classTeachers: {
          where: {
            OR: [{ endDate: null }, { endDate: { gte: today } }],
            class_: { active: true },
          },
          orderBy: { startDate: 'desc' },
          include: {
            class_: { select: { id: true, name: true, level: true, session: true, active: true } },
          },
        },
        coversCover: {
          take: 10,
          orderBy: { date: 'desc' },
          include: {
            originalTeacher: { select: { id: true, firstName: true, lastName: true } },
            class_: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!t) return null;
    const currentClassCount = new Set((t.classTeachers || []).map(ct => ct.classId)).size;
    const effectiveActive = t.active !== false;
    const currentlyTeaching = currentClassCount > 0 || t.isSalaried === true;
    return { ...t, currentClassCount, effectiveActive, currentlyTeaching };
  }

  async function createTeacher(data: Record<string, any>) {
    return prisma.teacher.create({ data: data as any });
  }

  async function updateTeacher(id: number, data: Record<string, any>) {
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    if (data.hourlyRate != null && data.hourlyRate !== '') data.hourlyRate = parseFloat(data.hourlyRate);
    return prisma.teacher.update({ where: { id }, data: data as any });
  }

  async function deleteTeacher(id: number) {
    return prisma.teacher.delete({ where: { id } });
  }

  // ── PROFIT MARGIN DASHBOARD ─────────────────
  // Per-class gross profit / gross margin over a date range, bucketed by week.
  // Cost = teacher hours × Teacher.hourlyRate (salaried teachers contribute 0,
  //   matching the Cover Dashboard convention).
  // Revenue = sum across active students of (BookingCourse.fee / (weeks * hoursPerWeek))
  //   × class block hours run that week.
  // V1 intentionally ignores cover overrides — the default ClassTeacher's rate is
  //   used for the whole window. Good enough for the broad-strokes view; refine later.
  async function profitMargin(query: Record<string, any>) {
    const today = new Date();
    const fromIso = query.from || new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const toIso = query.to || new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    const from = new Date(fromIso + 'T00:00:00Z');
    const to = new Date(toIso + 'T23:59:59Z');

    // Build week buckets (Monday-anchored) covering [from, to].
    const startMon = new Date(from);
    startMon.setUTCDate(startMon.getUTCDate() - ((startMon.getUTCDay() + 6) % 7));
    const buckets: { weekStart: Date; weekEnd: Date }[] = [];
    let cur = new Date(startMon);
    while (cur <= to) {
      const wEnd = new Date(cur);
      wEnd.setUTCDate(wEnd.getUTCDate() + 4); // Mon→Fri
      buckets.push({ weekStart: new Date(cur), weekEnd: wEnd });
      cur.setUTCDate(cur.getUTCDate() + 7);
    }

    // School closures within range
    const closures = await prisma.schoolClosure.findMany({
      where: { startDate: { lte: to }, endDate: { gte: from } },
      select: { startDate: true, endDate: true, isPaidHoliday: true },
    });
    const isClosed = (d: Date) => closures.some(c => d >= c.startDate && d <= c.endDate);

    // All active classes — we'll filter to those with activity in range
    const classes = await prisma.class.findMany({
      where: { active: true },
      include: {
        classroom: { select: { name: true } },
        classTeachers: { include: { teacher: true } },
      },
    });

    // For each class: compute block hours, then per-week cost + revenue.
    const out: any[] = [];
    for (const cls of classes) {
      // Block hours per day = (end - start - break)/60
      const [sh, sm] = (cls.startTime || '00:00').split(':').map(Number);
      const [eh, em] = (cls.endTime || '00:00').split(':').map(Number);
      const grossMin = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
      const blockHours = Math.max(0, (grossMin - (cls.breakMinutes || 0)) / 60);

      // Days the class runs (1=Mon..7=Sun stored as numbers in cls.days)
      const runDays = new Set<number>(cls.days || [1, 2, 3, 4, 5]);

      const weeks: any[] = [];
      let totalHours = 0, totalCost = 0, totalRevenue = 0;

      for (const b of buckets) {
        // Skip weeks entirely outside [from,to]
        if (b.weekEnd < from || b.weekStart > to) continue;

        // Determine teacher for this week (first ClassTeacher whose window overlaps)
        const ct = cls.classTeachers.find(ct =>
          ct.startDate <= b.weekEnd && (ct.endDate == null || ct.endDate >= b.weekStart)
        );
        const teacher = ct?.teacher;
        const tRate = teacher?.isSalaried ? 0 : Number(teacher?.hourlyRate || 0);

        // Days the class actually ran this week (excluding closures and cancelled occurrences)
        let daysRun = 0;
        for (let i = 0; i < 5; i++) {
          const d = new Date(b.weekStart);
          d.setUTCDate(d.getUTCDate() + i);
          // class.days uses 1=Mon..7=Sun; JS getUTCDay() 0=Sun..6=Sat → convert
          const dow = ((d.getUTCDay() + 6) % 7) + 1;
          if (!runDays.has(dow)) continue;
          if (d < from || d > to) continue;
          if (isClosed(d)) continue;
          daysRun++;
        }
        if (daysRun === 0) continue;

        // Subtract any cancelled ClassOccurrence rows in this week
        const cancelledCount = await prisma.classOccurrence.count({
          where: {
            classId: cls.id,
            cancelled: true,
            date: { gte: b.weekStart, lte: b.weekEnd },
          },
        });
        const effectiveDaysRun = Math.max(0, daysRun - cancelledCount);
        if (effectiveDaysRun === 0) continue;

        const hoursThisWeek = blockHours * effectiveDaysRun;

        // Cost: teacher rate × hours
        const cost = tRate * hoursThisWeek;

        // Revenue: sum of (each student's hourly rate × hours) for students assigned this week
        const assignments = await prisma.studentClassAssignment.findMany({
          where: {
            classId: cls.id,
            weekStart: { lte: b.weekEnd },
            OR: [{ weekEnd: null }, { weekEnd: { gte: b.weekStart } }],
          },
          include: {
            bookingCourse: { select: { fee: true, weeks: true, hoursPerWeek: true } },
          },
        });
        let studentCount = 0;
        let revenue = 0;
        for (const a of assignments) {
          const bc = a.bookingCourse;
          if (!bc || !bc.fee || !bc.weeks || !bc.hoursPerWeek) continue;
          const totalCourseHours = Number(bc.weeks) * Number(bc.hoursPerWeek);
          if (totalCourseHours <= 0) continue;
          const studentHourlyRate = Number(bc.fee) / totalCourseHours;
          revenue += studentHourlyRate * hoursThisWeek;
          studentCount++;
        }

        const profit = revenue - cost;
        const marginPct = revenue > 0 ? (profit / revenue) * 100 : null;
        weeks.push({
          weekStart: b.weekStart.toISOString().slice(0, 10),
          weekEnd: b.weekEnd.toISOString().slice(0, 10),
          hours: round2(hoursThisWeek),
          studentCount,
          revenue: round2(revenue),
          cost: round2(cost),
          profit: round2(profit),
          marginPct: marginPct == null ? null : round2(marginPct),
          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : null,
          teacherRate: round2(tRate),
        });
        totalHours += hoursThisWeek;
        totalCost += cost;
        totalRevenue += revenue;
      }

      if (!weeks.length) continue; // class had no activity in range — skip
      // Skip classes with no students in any week of the range. Even if a
      // teacher was rostered, an empty class isn't useful in a profit report
      // (it'll just show a flat negative cost line). Surface those elsewhere
      // if/when we want a "rostered but unenrolled" alert.
      if (!weeks.some(w => w.studentCount > 0)) continue;

      // Pull a representative teacher for the row header (most recent in window)
      const repTeacher = cls.classTeachers
        .filter(ct => ct.startDate <= to && (ct.endDate == null || ct.endDate >= from))
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0]?.teacher;

      out.push({
        classId: cls.id,
        className: cls.name,
        level: cls.level,
        session: cls.session,
        classroom: cls.classroom?.name || null,
        teacherName: repTeacher ? `${repTeacher.firstName} ${repTeacher.lastName}` : null,
        teacherRate: repTeacher?.isSalaried ? 0 : round2(Number(repTeacher?.hourlyRate || 0)),
        teacherSalaried: !!repTeacher?.isSalaried,
        weeks,
        totals: {
          hours: round2(totalHours),
          revenue: round2(totalRevenue),
          cost: round2(totalCost),
          profit: round2(totalRevenue - totalCost),
          marginPct: totalRevenue > 0 ? round2(((totalRevenue - totalCost) / totalRevenue) * 100) : null,
        },
      });
    }

    // Sort: lowest margin first (operationally most useful — surfaces problem classes)
    out.sort((a, b) => {
      const am = a.totals.marginPct ?? 999;
      const bm = b.totals.marginPct ?? 999;
      return am - bm;
    });

    // School-level rollup
    const schoolTotals = out.reduce((acc, c) => ({
      hours: acc.hours + c.totals.hours,
      revenue: acc.revenue + c.totals.revenue,
      cost: acc.cost + c.totals.cost,
      profit: acc.profit + c.totals.profit,
    }), { hours: 0, revenue: 0, cost: 0, profit: 0 });

    return {
      from: fromIso,
      to: toIso,
      classes: out,
      school: {
        hours: round2(schoolTotals.hours),
        revenue: round2(schoolTotals.revenue),
        cost: round2(schoolTotals.cost),
        profit: round2(schoolTotals.profit),
        marginPct: schoolTotals.revenue > 0
          ? round2((schoolTotals.profit / schoolTotals.revenue) * 100)
          : null,
      },
    };
  }

  function round2(n: number) {
    return Math.round(n * 100) / 100;
  }

  // ── Balances + Outstandings ─────────────────────
  // Two operationally distinct pools:
  //   - Balances:    money owed on bookings whose serviceStart > today
  //                  (Sales pursues — student hasn't arrived yet)
  //   - Outstandings: money owed on bookings already in school or departed
  //                  (Accounts pursues — student is here / has been)
  //
  // Goal: nobody crosses a Monday-morning threshold without full payment.
  // Departed bookings are mostly historical Fidelo ledger noise — included
  // but pre-summarised so the UI can collapse them.
  async function balances() {
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const monday = new Date(today);
    monday.setUTCDate(monday.getUTCDate() - ((today.getUTCDay() + 6) % 7));
    const sunday = new Date(monday); sunday.setUTCDate(sunday.getUTCDate() + 6);
    const fourWeeks = new Date(monday); fourWeeks.setUTCDate(fourWeeks.getUTCDate() + 28);
    const twelveMonthsAgo = new Date(today); twelveMonthsAgo.setUTCMonth(twelveMonthsAgo.getUTCMonth() - 12);

    // Narrow at DB-level: pre-arrival, currently in-school, departed in last
    // 12 months only, or no arrival date. Excludes the long Fidelo tail of
    // 4+ year-old "departed" bookings whose ledger noise inflates totals
    // and slows page-load.
    const bookings = await prisma.booking.findMany({
      where: {
        // Ignore trivial residuals (rounding noise, €0.50 reconciliation
        // dust, etc) — only surface balances that are worth chasing.
        amountOpen: { gte: 5 },
        status: { not: 'CANCELLED' },
        OR: [
          { serviceStart: { gt: today } },                           // future arrivals
          { AND: [                                                   // in school now
            { serviceStart: { lte: today } },
            { OR: [{ serviceEnd: null }, { serviceEnd: { gte: today } }] },
          ]},
          { AND: [                                                   // departed in last 12mo
            { serviceEnd: { lt: today } },
            { serviceEnd: { gte: twelveMonthsAgo } },
          ]},
          { serviceStart: null },                                    // no arrival date
        ],
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, nationality: true, currentLevel: true } },
        agency:  { select: { id: true, name: true } },
        courses: { select: { name: true, category: true, level: true, startDate: true, endDate: true, weeks: true, hoursPerWeek: true, fee: true } },
      },
      orderBy: [{ serviceStart: 'asc' }],
    });

    const buckets: Record<string, any[]> = {
      arrivingThisWeek: [],   // serviceStart in [monday, sunday] — most urgent
      arrivingNext4Weeks: [], // (sunday, +4 weeks]
      arrivingLater: [],      // > +4 weeks
      inSchoolNow: [],        // serviceStart <= today AND serviceEnd >= today
      departed: [],           // serviceEnd < today
      noArrivalDate: [],      // serviceStart NULL
    };

    for (const b of bookings) {
      const open  = Number(b.amountOpen  || 0);
      const total = Number(b.amountTotal || 0);
      const paid  = Number(b.amountPaid  || 0);
      // Pick the longest course as the "main" course (renewals+side-courses confuse rows)
      const mainCourse = b.courses.slice().sort((a, b) => Number(b.weeks || 0) - Number(a.weeks || 0))[0];
      const row = {
        bookingId: b.id,
        fideloBookingId: b.fideloBookingId,
        hubspotDealId:   b.hubspotDealId,
        student: b.student ? {
          id: b.student.id,
          name: `${b.student.firstName} ${b.student.lastName}`.trim(),
          nationality: b.student.nationality,
          level: b.student.currentLevel,
        } : null,
        agency: b.agency ? { id: b.agency.id, name: b.agency.name } : null,
        status: b.status,
        amountTotal: round2(total),
        amountPaid:  round2(paid),
        amountOpen:  round2(open),
        currency:    b.currency,
        serviceStart: b.serviceStart ? b.serviceStart.toISOString().slice(0, 10) : null,
        serviceEnd:   b.serviceEnd   ? b.serviceEnd.toISOString().slice(0, 10)   : null,
        course: mainCourse ? {
          name: mainCourse.name,
          category: mainCourse.category,
          level: mainCourse.level,
          weeks: mainCourse.weeks,
        } : null,
        // For sorting: days until arrival (pre) or days since arrival (post)
        daysUntilArrival: b.serviceStart ? Math.round((b.serviceStart.getTime() - today.getTime()) / 86400000) : null,
        daysSinceArrival: b.serviceStart ? Math.round((today.getTime() - b.serviceStart.getTime()) / 86400000) : null,
      };

      if (!b.serviceStart) {
        buckets.noArrivalDate.push(row);
      } else if (b.serviceStart > today) {
        if (b.serviceStart <= sunday) buckets.arrivingThisWeek.push(row);
        else if (b.serviceStart <= fourWeeks) buckets.arrivingNext4Weeks.push(row);
        else buckets.arrivingLater.push(row);
      } else {
        // already arrived
        const ended = b.serviceEnd && b.serviceEnd < today;
        if (ended) buckets.departed.push(row);
        else buckets.inSchoolNow.push(row);
      }
    }

    // Default sort: departed by serviceEnd DESC (newest leavers first — most
    // actionable for accounts chasing recent walk-outs). Other buckets keep
    // the DB-level serviceStart ASC ordering.
    buckets.departed.sort((a, b) => (b.serviceEnd || '').localeCompare(a.serviceEnd || ''));

    const total = (rows: any[]) => round2(rows.reduce((n, r) => n + r.amountOpen, 0));
    return {
      asOf: today.toISOString().slice(0, 10),
      mondayThisWeek: monday.toISOString().slice(0, 10),
      // Balances = pre-arrival (Sales chases)
      balances: {
        arrivingThisWeek: buckets.arrivingThisWeek,
        arrivingNext4Weeks: buckets.arrivingNext4Weeks,
        arrivingLater: buckets.arrivingLater,
        totals: {
          arrivingThisWeek: { count: buckets.arrivingThisWeek.length, eur: total(buckets.arrivingThisWeek) },
          arrivingNext4Weeks: { count: buckets.arrivingNext4Weeks.length, eur: total(buckets.arrivingNext4Weeks) },
          arrivingLater: { count: buckets.arrivingLater.length, eur: total(buckets.arrivingLater) },
          all: {
            count: buckets.arrivingThisWeek.length + buckets.arrivingNext4Weeks.length + buckets.arrivingLater.length,
            eur: round2(total(buckets.arrivingThisWeek) + total(buckets.arrivingNext4Weeks) + total(buckets.arrivingLater)),
          },
        },
      },
      // Outstandings = post-arrival (Accounts chases)
      outstandings: {
        inSchoolNow: buckets.inSchoolNow,
        departed: buckets.departed,
        noArrivalDate: buckets.noArrivalDate,
        totals: {
          inSchoolNow: { count: buckets.inSchoolNow.length, eur: total(buckets.inSchoolNow) },
          departed: { count: buckets.departed.length, eur: total(buckets.departed) },
          noArrivalDate: { count: buckets.noArrivalDate.length, eur: total(buckets.noArrivalDate) },
          all: {
            count: buckets.inSchoolNow.length + buckets.departed.length + buckets.noArrivalDate.length,
            eur: round2(total(buckets.inSchoolNow) + total(buckets.departed) + total(buckets.noArrivalDate)),
          },
        },
      },
    };
  }

  return {
    listClassrooms,
    listClasses, getClassById, createClass, updateClass, deleteClass,
    assignStudent, removeAssignment, endAssignment, unassignedStudents,
    getClassTeachers, assignClassTeacher, removeClassTeacher,
    getCovers, createCover, removeCover, coverDashboard, profitMargin, balances,
    listTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher,
  };
}
