import { PrismaClient } from '../generated/prisma/client';

export function attendanceScripts(prisma: PrismaClient) {

  // ── Get or create class occurrence for a date ──
  // Two normalisations on the way in:
  //   1) Snap the date to UTC-midnight via Date.UTC(y,m,d) using the local
  //      Y/M/D. Without this, a local-midnight Date in BST (UTC+1) serialises
  //      as `…T23:00:00Z` and Postgres truncates to the *previous* day in a
  //      `@db.Date` column — that's how phantom Sunday occurrences leaked in
  //      (Apr 26 / May 3 etc.). The scheduling regenerator already does this;
  //      attendance paths must do it too.
  //   2) If the class has a `days` whitelist (Mon=1..Fri=5) and the requested
  //      date is not in it, refuse — second line of defence in case a UI loop
  //      ever asks for a Saturday/Sunday by mistake.
  async function ensureOccurrence(classId: number, date: Date) {
    const cls = await prisma.class.findUnique({ where: { id: classId }, select: { days: true } });
    const dayCodes: number[] = ((cls?.days as any) || []) as number[];
    if (dayCodes.length && !dayCodes.includes(date.getDay())) {
      throw new Error(`Class ${classId} doesn't run on ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()]} — refusing to create occurrence for ${date.toISOString().slice(0,10)}`);
    }
    const dateOnly = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const existing = await prisma.classOccurrence.findUnique({
      where: { classId_date: { classId, date: dateOnly } },
    });
    if (existing) return existing;
    return prisma.classOccurrence.create({ data: { classId, date: dateOnly } as any });
  }

  // ── Get attendance for a class for a full week ──
  async function getWeekAttendance(classId: number, weekOf: string) {
    const monday = new Date(weekOf);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    const friday = days[4];

    // Get class info + students for this week
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classroom: true,
        studentAssignments: {
          where: {
            weekStart: { lte: friday },
            OR: [{ weekEnd: null }, { weekEnd: { gte: monday } }],
          },
          include: {
            student: { select: { id: true, firstName: true, lastName: true, currentLevel: true, nationality: true } },
            bookingCourse: {
              include: {
                booking: {
                  include: {
                    student: { select: { id: true, firstName: true, lastName: true, currentLevel: true, nationality: true } }
                  }
                }
              }
            }
          },
        },
        classTeachers: {
          where: {
            startDate: { lte: friday },
            OR: [{ endDate: null }, { endDate: { gte: monday } }],
          },
          include: { teacher: true },
        },
      },
    });

    if (!classData) return null;

    // Block hours based on session
    const blockHours = classData.session === 'MORNING' ? 3 : 3.25; // 09:00-12:00 or 13:45-17:00

    // Ensure occurrences for all 5 days
    const occurrences: any[] = [];
    for (const d of days) {
      occurrences.push(await ensureOccurrence(classId, d));
    }

    // Get all attendance records for these occurrences
    const occIds = occurrences.map(o => o.id);
    const records = await prisma.attendance.findMany({
      where: { occurrenceId: { in: occIds } },
    });

    // Pull any student-recorded absence reasons covering the same week, so the
    // admin grid can show a small badge on absences that have a reason on file.
    const studentIdsInWeek = (classData.studentAssignments || [])
      .map(sa => sa.bookingCourse?.booking?.student?.id || (sa as any).student?.id)
      .filter(Boolean);
    const reasonRows = studentIdsInWeek.length
      ? await prisma.absenceReason.findMany({
          where: {
            studentId: { in: studentIdsInWeek },
            date: { in: days },
          },
          select: {
            studentId: true, date: true, reason: true, noteText: true,
            _count: { select: { certFiles: true } },
          },
        })
      : [];
    const reasonByKey = new Map(reasonRows.map(r => [
      `${r.studentId}|${r.date.toISOString().slice(0, 10)}`,
      { reason: r.reason, noteText: r.noteText, certCount: r._count.certFiles },
    ]));

    // Build student rows with daily attendance.
    // Student can come from two paths:
    //   1. bookingCourse → booking → student (when assignment is linked to a booking course)
    //   2. direct studentId on the assignment (manual assignments without a booking course)
    const students = (classData.studentAssignments || []).map(sa => {
      const student = sa.bookingCourse?.booking?.student || (sa as any).student;
      if (!student) return null;

      const dailyData = days.map((d, i) => {
        const occ = occurrences[i];
        const record = records.find(r => r.studentId === student.id && r.occurrenceId === occ.id);
        const iso = d.toISOString().split('T')[0];
        const rsn = reasonByKey.get(`${student.id}|${iso}`);
        return {
          date: iso,
          occurrenceId: occ.id,
          cancelled: occ.cancelled,
          status: record?.status || null,
          hours: record ? parseFloat(String((record as any).hours || blockHours)) : null,
          note: record?.note || null,
          studentReason: rsn?.reason || null,
          studentReasonNote: rsn?.noteText || null,
          studentReasonCertCount: rsn?.certCount || 0,
        };
      });

      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        nationality: student.nationality,
        level: student.currentLevel,
        days: dailyData,
      };
    }).filter(Boolean);

    return {
      classId,
      className: classData.name,
      classroom: classData.classroom?.name,
      session: classData.session,
      blockHours,
      teacher: classData.classTeachers?.[0]?.teacher || null,
      weekStart: monday.toISOString().split('T')[0],
      days: days.map(d => d.toISOString().split('T')[0]),
      cancellations: occurrences.map((o, i) => ({ date: days[i].toISOString().split('T')[0], cancelled: o.cancelled })),
      students,
    };
  }

  // ── Get attendance for a class on a specific date ──
  async function getClassAttendance(classId: number, date: string) {
    const d = new Date(date);
    const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon...
    if (dayOfWeek === 0 || dayOfWeek === 6) return { students: [], attendance: [], date, dayOfWeek };

    // Get the Monday of this week for filtering assignments
    const monday = new Date(d);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);

    // Get students assigned to this class for this week
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classroom: true,
        studentAssignments: {
          where: {
            weekStart: { lte: friday },
            OR: [
              { weekEnd: null },
              { weekEnd: { gte: monday } },
            ],
          },
          include: {
            bookingCourse: {
              include: {
                booking: {
                  include: {
                    student: {
                      select: { id: true, firstName: true, lastName: true, currentLevel: true, nationality: true }
                    }
                  }
                }
              }
            }
          },
        },
        classTeachers: {
          where: {
            startDate: { lte: d },
            OR: [
              { endDate: null },
              { endDate: { gte: d } },
            ],
          },
          include: { teacher: true },
        },
      },
    });

    if (!classData) return null;

    // Get or create occurrence
    const occurrence = await ensureOccurrence(classId, d);

    // Get existing attendance records
    const records = await prisma.attendance.findMany({
      where: { occurrenceId: occurrence.id },
    });

    // Build student list with attendance status
    const students = (classData.studentAssignments || []).map(sa => {
      const student = sa.bookingCourse?.booking?.student;
      if (!student) return null;
      const record = records.find(r => r.studentId === student.id);
      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        nationality: student.nationality,
        level: student.currentLevel,
        attendanceId: record?.id || null,
        status: record?.status || null,
        note: record?.note || null,
      };
    }).filter(Boolean);

    return {
      classId,
      className: classData.name,
      classroom: classData.classroom?.name,
      session: classData.session,
      date,
      occurrenceId: occurrence.id,
      cancelled: occurrence.cancelled,
      teacher: classData.classTeachers?.[0]?.teacher || null,
      students,
    };
  }

  // ── Mark attendance for a student ──
  async function markAttendance(data: {
    studentId: number;
    occurrenceId: number;
    status: string;
    hours?: number;
    note?: string;
    recordedBy?: string;
  }) {
    const existing = await prisma.attendance.findUnique({
      where: {
        studentId_occurrenceId: {
          studentId: data.studentId,
          occurrenceId: data.occurrenceId,
        },
      },
    });

    const payload: any = {
      status: data.status as any,
      hours: data.hours != null ? data.hours : null,
      note: data.note || null,
      recordedBy: data.recordedBy || null,
    };

    if (existing) {
      return prisma.attendance.update({ where: { id: existing.id }, data: payload });
    }

    return prisma.attendance.create({
      data: {
        studentId: data.studentId,
        occurrenceId: data.occurrenceId,
        ...payload,
      } as any,
    });
  }

  // ── Bulk mark attendance (all students at once) ──
  async function bulkMarkAttendance(records: Array<{
    studentId: number;
    occurrenceId: number;
    status: string;
    note?: string;
  }>) {
    const results = [];
    for (const r of records) {
      results.push(await markAttendance(r));
    }
    return results;
  }

  // ── Cancel/uncancel a class occurrence ──
  async function toggleCancelled(classId: number, date: string) {
    const d = new Date(date);
    const occ = await ensureOccurrence(classId, d);
    return prisma.classOccurrence.update({
      where: { id: occ.id },
      data: { cancelled: !occ.cancelled },
    });
  }

  // ── Student attendance summary (for a booking/student) ──
  // Holiday-aware: rows whose occurrence.date falls inside any BookingHoliday
  // window are flagged onHoliday=true and excluded from the rate calculation.
  // The full record list is still returned (with onHoliday flag) so the UI
  // can display them with a 🏖️ badge.
  async function studentSummary(studentId: number) {
    const { fetchStudentHolidays, filterOutHolidayDates } = await import('./attendance-pct');
    const records = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        occurrence: {
          include: {
            class_: { select: { name: true, session: true } },
          },
        },
      },
      orderBy: { occurrence: { date: 'desc' } },
    });

    const holidays = await fetchStudentHolidays(prisma, studentId);
    const ranges = holidays.map(h => {
      const s = new Date(h.startDate); s.setHours(0,0,0,0);
      const e = new Date(h.endDate); e.setHours(0,0,0,0);
      return [s.getTime(), e.getTime()] as const;
    });
    const onHolidayDate = (dateLike: Date | null) => {
      if (!dateLike) return false;
      const d = new Date(dateLike); d.setHours(0,0,0,0);
      const t = d.getTime();
      return ranges.some(([s, e]) => t >= s && t <= e);
    };

    const flagged = records.map(r => ({ ...r, onHoliday: onHolidayDate(r.occurrence?.date || null) }));
    const counted = filterOutHolidayDates(records, holidays);

    const total = counted.length;
    const present = counted.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const absent = counted.filter(r => r.status === 'ABSENT_UNCERTIFIED').length;
    const absentCertified = counted.filter(r => r.status === 'ABSENT_CERTIFIED').length;
    const excused = counted.filter(r => r.status === 'EXCUSED').length;
    const onHolidayCount = records.length - counted.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, absentCertified, excused, onHoliday: onHolidayCount, rate, records: flagged };
  }

  return {
    getWeekAttendance, getClassAttendance, markAttendance, bulkMarkAttendance,
    toggleCancelled, studentSummary,
  };
}
