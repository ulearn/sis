import { PrismaClient } from '../generated/prisma/client';

export function attendanceScripts(prisma: PrismaClient) {

  // ── Get or create class occurrence for a date ──
  async function ensureOccurrence(classId: number, date: Date) {
    const existing = await prisma.classOccurrence.findUnique({
      where: { classId_date: { classId, date } },
    });
    if (existing) return existing;
    return prisma.classOccurrence.create({ data: { classId, date } as any });
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

    // Build student rows with daily attendance
    const students = (classData.studentAssignments || []).map(sa => {
      const student = sa.bookingCourse?.booking?.student;
      if (!student) return null;

      const dailyData = days.map((d, i) => {
        const occ = occurrences[i];
        const record = records.find(r => r.studentId === student.id && r.occurrenceId === occ.id);
        return {
          date: d.toISOString().split('T')[0],
          occurrenceId: occ.id,
          cancelled: occ.cancelled,
          status: record?.status || null,
          hours: record ? parseFloat(String((record as any).hours || blockHours)) : null,
          note: record?.note || null,
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
  async function studentSummary(studentId: number) {
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

    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const absent = records.filter(r => r.status === 'ABSENT_UNCERTIFIED').length;
    const absentCertified = records.filter(r => r.status === 'ABSENT_CERTIFIED').length;
    const excused = records.filter(r => r.status === 'EXCUSED').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, absentCertified, excused, rate, records };
  }

  return {
    getWeekAttendance, getClassAttendance, markAttendance, bulkMarkAttendance,
    toggleCancelled, studentSummary,
  };
}
