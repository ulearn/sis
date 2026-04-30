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
                  include: { student: { select: { id: true, firstName: true, lastName: true, currentLevel: true } } }
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
                  include: { student: true }
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
  async function assignStudent(data: { bookingCourseId: number; classId: number; weekStart: string; weekEnd?: string }) {
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
      select: { endDate: true, booking: { select: { studentId: true } } },
    });
    const studentId = bc?.booking?.studentId ?? null;
    const fallbackEnd = bc?.endDate ?? null;
    const weekEnd = data.weekEnd ? new Date(data.weekEnd) : fallbackEnd;

    const created = await prisma.studentClassAssignment.create({
      data: {
        bookingCourseId: data.bookingCourseId,
        studentId,
        classId: data.classId,
        weekStart: new Date(data.weekStart),
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

    // When a range is bound, filter to bookings with no overlapping assignment in that range.
    // When unbounded, return all (caller filters client-side per class context).
    if (rangeStart || rangeEnd) {
      return bookingCourses.filter(bc => bc.classAssignments.length === 0);
    }
    return bookingCourses;
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

  return {
    listClassrooms,
    listClasses, getClassById, createClass, updateClass, deleteClass,
    assignStudent, removeAssignment, endAssignment, unassignedStudents,
    getClassTeachers, assignClassTeacher, removeClassTeacher,
    getCovers, createCover, removeCover, coverDashboard,
    listTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher,
  };
}
