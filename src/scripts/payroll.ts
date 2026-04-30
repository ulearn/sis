import { PrismaClient } from '../generated/prisma/client';

/**
 * Teacher Payroll Calculation Engine
 *
 * Calculates weekly teacher hours from SIS scheduling data:
 * - ClassOccurrence + TeacherAssignment = who taught what, when, for how long
 * - TeacherCover = substitution records
 * - ClassTeacher = default assignments (fallback)
 *
 * Output matches the teacher_payments MySQL schema for dashboard compatibility.
 * Payroll periods: monthly, pay on last Thursday, cutoff on Wednesday (inclusive).
 */

export function payrollScripts(prisma: PrismaClient) {

  // Get Monday of a given date's week
  function getMonday(d: Date): Date {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    dt.setDate(diff);
    dt.setHours(0, 0, 0, 0);
    return dt;
  }

  // Format week label like Fidelo: "Week 08, 16/02/2026 – 22/02/2026"
  function weekLabel(weekFrom: Date): string {
    const jan1 = new Date(weekFrom.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((weekFrom.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    const pad = (n: number) => String(n).padStart(2, '0');
    const from = `${pad(weekFrom.getDate())}/${pad(weekFrom.getMonth() + 1)}/${weekFrom.getFullYear()}`;
    const to = new Date(weekFrom);
    to.setDate(to.getDate() + 6);
    const toStr = `${pad(to.getDate())}/${pad(to.getMonth() + 1)}/${to.getFullYear()}`;
    return `Week ${pad(weekNum)}, ${from} – ${toStr}`;
  }

  // Compute hours from time strings like "09:00:00" and "12:15:00",
  // subtracting any unpaid break (in minutes) that sits inside the session
  function hoursFromTimes(startTime: string, endTime: string, breakMinutes: number = 0): number {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm) - (breakMinutes || 0);
    return Math.max(0, totalMinutes) / 60;
  }

  /**
   * Calculate weekly teacher hours for a date range.
   * Returns data structured to match the teacher_payments table.
   */
  async function calculateWeeklyHours(from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get all class occurrences in range
    const occurrences = await prisma.classOccurrence.findMany({
      where: {
        date: { gte: fromDate, lte: toDate },
        cancelled: false,
      },
      include: {
        class_: {
          select: { id: true, name: true, level: true, session: true, startTime: true, endTime: true, breakMinutes: true, isPrivate: true },
        },
        teacherAssignments: {
          include: {
            teacher: { select: { id: true, firstName: true, lastName: true, email: true, hourlyRate: true, isSalaried: true } },
          },
        },
      },
    });

    // Get default class-teacher assignments for fallback
    const classTeachers = await prisma.classTeacher.findMany({
      where: {
        startDate: { lte: toDate },
        OR: [{ endDate: null }, { endDate: { gte: fromDate } }],
      },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true, email: true, hourlyRate: true, isSalaried: true } },
      },
    });

    // Payroll does not consult absence/leave tables. The schedule is the single
    // source of truth: if the teacher is in the schedule (assignment, cover, or
    // default), they're paid. If they were absent, the schedule needs to show
    // it (cover added, assignment removed, etc.) — surface the discrepancy in
    // the schedule view so it can be audited and fixed at source. Silent
    // suppression here would just hide the problem.

    // Get covers
    const covers = await prisma.teacherCover.findMany({
      where: { date: { gte: fromDate, lte: toDate } },
      include: {
        coverTeacher: { select: { id: true, firstName: true, lastName: true, email: true, hourlyRate: true, isSalaried: true } },
      },
    });

    // Closures aren't read here — scheduling refuses to materialise occurrences
    // inside an unpaid closure (and removeOccurrencesInClosure deletes any that
    // slipped through when a closure was added later). Paid bank holidays keep
    // their occurrences so the default teacher gets paid normally — that's just
    // a regular occurrence to payroll. One source of truth: scheduling.

    // Get student counts per class (for the period)
    const assignments = await prisma.studentClassAssignment.findMany({
      where: {
        weekStart: { lte: toDate },
        OR: [{ weekEnd: null }, { weekEnd: { gte: fromDate } }],
      },
      select: { classId: true },
    });
    const studentCountByClass: Record<number, number> = {};
    for (const a of assignments) {
      studentCountByClass[a.classId] = (studentCountByClass[a.classId] || 0) + 1;
    }

    // Build weekly entries: teacher + class + week
    const entries: Record<string, {
      teacherId: number; teacherName: string; email: string;
      classId: number; className: string;
      weekFrom: Date; weekTo: Date; weekLabel: string;
      hours: number; studentCount: number; hourlyRate: number;
    }> = {};

    // Normalize "09:00" and "09:00:00" to the same form so cover/class time
    // comparisons (used to decide whether to deduct the class break) don't
    // silently fail just because of trailing-seconds differences.
    const normTime = (t: string) => (t || '').split(':').slice(0, 2).join(':');

    for (const occ of occurrences) {
      const cls = occ.class_;
      const occDate = new Date(occ.date);
      const monday = getMonday(occDate);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);

      // Determine who taught this occurrence
      let teachers: Array<{ id: number; firstName: string; lastName: string; email: string | null; hourlyRate: any; startTime: string; endTime: string }> = [];

      // Check for specific teacher assignments
      if (occ.teacherAssignments.length > 0) {
        for (const ta of occ.teacherAssignments) {
          teachers.push({
            ...ta.teacher,
            startTime: ta.startTime,
            endTime: ta.endTime,
          });
        }
      }

      // Check for covers on this date
      const dayCover = covers.find(c => c.classId === cls.id && new Date(c.date).toISOString().split('T')[0] === occDate.toISOString().split('T')[0]);
      if (dayCover) {
        // Replace with cover teacher
        teachers = [{
          ...dayCover.coverTeacher,
          startTime: dayCover.startTime,
          endTime: dayCover.endTime,
        }];
      }

      // Fallback to default class teacher. If the schedule says they're the
      // default and there's no specific assignment or cover, they get paid —
      // no extra rules. Absence/leave handling, private-class booking gating,
      // and any other "should this teacher be on the schedule today" logic
      // lives in scheduling, not here.
      if (teachers.length === 0) {
        const ct = classTeachers.find(ct =>
          ct.classId === cls.id &&
          new Date(ct.startDate) <= occDate &&
          (!ct.endDate || new Date(ct.endDate) >= occDate)
        );
        if (ct) {
          teachers.push({
            ...ct.teacher,
            startTime: cls.startTime,
            endTime: cls.endTime,
          });
        }
      }

      for (const teacher of teachers) {
        if ((teacher as any).isSalaried) continue; // salaried staff don't generate payroll hours

        // Private/1-to-1 classes are paid exactly as booked — no break ever subtracted.
        // For group classes, only subtract the class break when the teacher's session
        // spans the whole class (i.e. teacher times == class times). Covers/partial
        // assignments with custom times are assumed to already exclude breaks.
        // Use normalized times — class.start_time is stored as "09:00" but cover.start_time
        // as "09:00:00", and the raw === would always fail for full-class covers.
        const isPrivate = (cls as any).isPrivate === true;
        const fullSessionMatch = normTime(teacher.startTime) === normTime(cls.startTime)
                              && normTime(teacher.endTime)   === normTime(cls.endTime);
        const useBreak = (!isPrivate && fullSessionMatch) ? ((cls as any).breakMinutes || 0) : 0;
        const hours = hoursFromTimes(teacher.startTime, teacher.endTime, useBreak);
        const key = `${teacher.id}-${cls.id}-${monday.toISOString().split('T')[0]}`;
        const name = `${teacher.lastName}, ${teacher.firstName}`;

        if (!entries[key]) {
          entries[key] = {
            teacherId: teacher.id,
            teacherName: name,
            email: teacher.email || '',
            classId: cls.id,
            className: cls.name,
            weekFrom: monday,
            weekTo: sunday,
            weekLabel: weekLabel(monday),
            hours: 0,
            studentCount: studentCountByClass[cls.id] || 0,
            hourlyRate: Number(teacher.hourlyRate || 0),
          };
        }
        entries[key].hours += hours;
      }
    }

    return Object.values(entries);
  }

  /**
   * Refresh payroll entries for a date range — recalculate from scheduling data and upsert.
   * Stale entries (those that no longer match the current schedule, e.g. because a cover
   * was added or a class was deactivated) are deleted so the dashboard stays in sync.
   * Manual fields on surviving rows (managerChecked, weeklyPay, hoursIncludedThisMonth,
   * leaveTaken, sickDays, ppsNumber) are preserved across upsert.
   */
  async function refreshPayroll(from: string, to: string) {
    // Make sure occurrences exist for the range before calculating. Scheduling
    // owns the rules (closures, private-class enrolment, day-of-week pattern) —
    // we just trigger materialisation and consume whatever it produces.
    try {
      const { schedulingScripts } = await import('./scheduling');
      await schedulingScripts(prisma).generateOccurrences(new Date(from), new Date(to));
    } catch (e) { console.error('refresh prep failed:', e); }

    const calculated = await calculateWeeklyHours(from, to);

    // Delete entries that overlap the refreshed range and are no longer produced by
    // the fresh calculation. Use *overlap* semantics (weekFrom <= to AND weekTo >= from)
    // so straddling weeks at the period boundaries (e.g. WK 13 starts before the period,
    // WK 18 ends after it) are checked too — otherwise old rows from a prior schedule
    // sit forever and inflate the dashboard.
    const expectedKeys = new Set(
      calculated.map(e => `${e.teacherId}-${e.classId}-${e.weekFrom.toISOString().split('T')[0]}`)
    );
    const existing = await prisma.teacherPayrollEntry.findMany({
      where: {
        weekFrom: { lte: new Date(to) },
        weekTo:   { gte: new Date(from) },
      },
      select: { compositeKey: true },
    });
    const stale = existing
      .map(e => e.compositeKey)
      .filter(k => !expectedKeys.has(k));
    let removed = 0;
    if (stale.length) {
      const r = await prisma.teacherPayrollEntry.deleteMany({
        where: { compositeKey: { in: stale } },
      });
      removed = r.count;
    }

    let upserted = 0;
    for (const entry of calculated) {
      const compositeKey = `${entry.teacherId}-${entry.classId}-${entry.weekFrom.toISOString().split('T')[0]}`;
      const amount = Math.round(entry.hours * entry.hourlyRate * 100) / 100;

      await prisma.teacherPayrollEntry.upsert({
        where: { compositeKey },
        update: {
          hours: entry.hours,
          amount,
          studentCount: entry.studentCount,
          hourlyRate: entry.hourlyRate,
          className: entry.className,
          email: entry.email,
        },
        create: {
          teacherId: entry.teacherId,
          teacherName: entry.teacherName,
          email: entry.email,
          classId: entry.classId,
          className: entry.className,
          compositeKey,
          weekLabel: entry.weekLabel,
          weekFrom: entry.weekFrom,
          weekTo: entry.weekTo,
          hours: entry.hours,
          hourlyRate: entry.hourlyRate,
          amount,
          studentCount: entry.studentCount,
          lessons: entry.hours, // 1 lesson = 1 hour for now
        },
      });
      upserted++;
    }

    return {
      upserted, removed,
      message: `Refreshed ${upserted} entries${removed ? ` (${removed} stale removed)` : ''}`,
    };
  }

  /**
   * Get weekly payroll data for a date range (for dashboard).
   */
  async function getWeeklyData(from: string, to: string) {
    return prisma.teacherPayrollEntry.findMany({
      where: {
        weekFrom: { gte: new Date(from) },
        weekTo: { lte: new Date(to) },
      },
      orderBy: [{ teacherName: 'asc' }, { weekFrom: 'asc' }, { className: 'asc' }],
    });
  }

  /**
   * Get monthly aggregated data for a payroll period.
   */
  async function getMonthlyData(period: number, year: number) {
    const pp = await prisma.payrollPeriod.findUnique({
      where: { period_year: { period, year } },
    });
    if (!pp) throw new Error(`Period ${period}/${year} not found`);

    const entries = await prisma.teacherPayrollEntry.findMany({
      where: {
        weekFrom: { gte: pp.dateFrom },
        weekTo: { lte: pp.dateTo },
      },
    });

    // Get monthly adjustments
    const adjustments = await prisma.teacherMonthlyAdjustment.findMany({
      where: { month: pp.month, year },
    });
    const adjMap: Record<string, { other: number; impactBonus: number }> = {};
    for (const a of adjustments) {
      adjMap[a.teacherName] = { other: Number(a.other || 0), impactBonus: Number(a.impactBonus || 0) };
    }

    // Aggregate by teacher
    const byTeacher: Record<string, {
      teacherName: string; email: string; ppsNumber: string;
      totalHours: number; totalPay: number; avgRate: number;
      leaveAccrued: number; leaveTaken: number; leaveBalance: number;
      sickDays: number; other: number; impactBonus: number;
      weekCount: number;
    }> = {};

    for (const e of entries) {
      if (!byTeacher[e.teacherName]) {
        const adj = adjMap[e.teacherName] || { other: 0, impactBonus: 0 };
        byTeacher[e.teacherName] = {
          teacherName: e.teacherName,
          email: e.email || '',
          ppsNumber: e.ppsNumber || '',
          totalHours: 0, totalPay: 0, avgRate: 0,
          leaveAccrued: 0, leaveTaken: Number(e.leaveTaken || 0), leaveBalance: Number(e.leaveBalance || 0),
          sickDays: Number(e.sickDays || 0),
          other: adj.other, impactBonus: adj.impactBonus,
          weekCount: 0,
        };
      }
      byTeacher[e.teacherName].totalHours += Number(e.hours);
      byTeacher[e.teacherName].totalPay += Number(e.amount);
      byTeacher[e.teacherName].weekCount++;
    }

    // Calculate averages and leave accrual (8% of hours)
    for (const t of Object.values(byTeacher)) {
      t.avgRate = t.weekCount > 0 ? Math.round(t.totalPay / t.totalHours * 100) / 100 : 0;
      t.leaveAccrued = Math.round(t.totalHours * 0.08 * 100) / 100;
    }

    return {
      period: pp,
      teachers: Object.values(byTeacher).sort((a, b) => a.teacherName.localeCompare(b.teacherName)),
    };
  }

  // Payroll periods
  async function listPeriods(year?: number) {
    const where = year ? { year } : {};
    return prisma.payrollPeriod.findMany({ where, orderBy: [{ year: 'asc' }, { period: 'asc' }] });
  }

  async function getCurrentPeriod() {
    const today = new Date().toISOString().split('T')[0];
    return prisma.payrollPeriod.findFirst({
      where: { dateFrom: { lte: new Date(today) }, dateTo: { gte: new Date(today) } },
    });
  }

  // Monthly adjustments
  async function saveAdjustment(teacherName: string, month: string, year: number, other?: number, impactBonus?: number) {
    return prisma.teacherMonthlyAdjustment.upsert({
      where: { teacherName_month_year: { teacherName, month, year } },
      update: { other: other ?? 0, impactBonus: impactBonus ?? 0 },
      create: { teacherName, month, year, other: other ?? 0, impactBonus: impactBonus ?? 0 },
    });
  }

  // ── LOCK / AUTHORIZATION ──────────────────────
  // A period is currently LOCKED iff the latest payroll_authorizations row
  // for (period, year) has unlockedAt = null. Each authorize inserts a new
  // row; each unlock stamps the latest row's unlockedAt. No overwrites —
  // full audit trail preserved.

  async function getLatestAuthorization(period: number, year: number) {
    return prisma.payrollAuthorization.findFirst({
      where: { period, year },
      orderBy: { createdAt: 'desc' },
    });
  }

  async function isPeriodLocked(period: number, year: number): Promise<boolean> {
    const latest = await getLatestAuthorization(period, year);
    return !!latest && latest.unlockedAt == null;
  }

  async function authorizePayroll(period: number, year: number, authorizedBy: string) {
    if (await isPeriodLocked(period, year)) {
      throw Object.assign(new Error('Period already authorized — unlock first'), { code: 'PERIOD_LOCKED' });
    }
    const monthly = await getMonthlyData(period, year);
    const totalHours = monthly.teachers.reduce((s, t) => s + t.totalHours, 0);
    const totalPay = monthly.teachers.reduce((s, t) => s + t.totalPay + t.other + t.impactBonus, 0);
    return prisma.payrollAuthorization.create({
      data: {
        period, year, month: monthly.period.month, authorizedBy,
        totalHours, totalPay, snapshotJson: JSON.stringify(monthly),
      },
    });
  }

  async function unlockPayroll(period: number, year: number, unlockedBy: string) {
    const latest = await getLatestAuthorization(period, year);
    if (!latest || latest.unlockedAt != null) {
      throw Object.assign(new Error('Period is not currently authorized'), { code: 'PERIOD_NOT_LOCKED' });
    }
    return prisma.payrollAuthorization.update({
      where: { id: latest.id },
      data: { unlockedAt: new Date(), unlockedBy },
    });
  }

  return {
    calculateWeeklyHours, refreshPayroll,
    getWeeklyData, getMonthlyData,
    listPeriods, getCurrentPeriod,
    saveAdjustment,
    authorizePayroll, unlockPayroll, isPeriodLocked, getLatestAuthorization,
  };
}
