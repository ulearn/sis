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

  // Compute hours from time strings like "09:00:00" and "12:15:00"
  function hoursFromTimes(startTime: string, endTime: string): number {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return (eh * 60 + em - sh * 60 - sm) / 60;
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
          select: { id: true, name: true, level: true, session: true, startTime: true, endTime: true },
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

    // Get covers
    const covers = await prisma.teacherCover.findMany({
      where: { date: { gte: fromDate, lte: toDate } },
      include: {
        coverTeacher: { select: { id: true, firstName: true, lastName: true, email: true, hourlyRate: true, isSalaried: true } },
      },
    });

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

      // Fallback to default class teacher
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

        const hours = hoursFromTimes(teacher.startTime, teacher.endTime);
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
   */
  async function refreshPayroll(from: string, to: string) {
    const calculated = await calculateWeeklyHours(from, to);

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

    return { upserted, message: `Refreshed ${upserted} payroll entries` };
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

  // Authorization
  async function authorizePayroll(period: number, year: number, authorizedBy: string) {
    const monthly = await getMonthlyData(period, year);
    const totalHours = monthly.teachers.reduce((s, t) => s + t.totalHours, 0);
    const totalPay = monthly.teachers.reduce((s, t) => s + t.totalPay + t.other + t.impactBonus, 0);

    return prisma.payrollAuthorization.upsert({
      where: { period_year: { period, year } },
      update: { authorizedBy, totalHours, totalPay, snapshotJson: JSON.stringify(monthly) },
      create: { period, year, month: monthly.period.month, authorizedBy, totalHours, totalPay, snapshotJson: JSON.stringify(monthly) },
    });
  }

  return {
    calculateWeeklyHours, refreshPayroll,
    getWeeklyData, getMonthlyData,
    listPeriods, getCurrentPeriod,
    saveAdjustment, authorizePayroll,
  };
}
