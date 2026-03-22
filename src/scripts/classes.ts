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
    const weekOf = query.weekOf ? new Date(query.weekOf) : new Date();
    const monday = new Date(weekOf);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7)); // get Monday
    monday.setHours(0,0,0,0);
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);

    return prisma.class.findMany({
      where,
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

  async function createClass(data: Record<string, any>) {
    return prisma.class.create({
      data: data as any,
      include: { classroom: true },
    });
  }

  async function updateClass(id: number, data: Record<string, any>) {
    return prisma.class.update({
      where: { id },
      data: data as any,
      include: { classroom: true },
    });
  }

  async function deleteClass(id: number) {
    return prisma.class.delete({ where: { id } });
  }

  // ── Student ↔ Class assignments ─────────────
  async function assignStudent(data: { bookingCourseId: number; classId: number; weekStart: string; weekEnd?: string }) {
    return prisma.studentClassAssignment.create({
      data: {
        bookingCourseId: data.bookingCourseId,
        classId: data.classId,
        weekStart: new Date(data.weekStart),
        weekEnd: data.weekEnd ? new Date(data.weekEnd) : null,
      } as any,
    });
  }

  async function removeAssignment(id: number) {
    return prisma.studentClassAssignment.delete({ where: { id } });
  }

  // ── Unassigned students (booking courses not in any class for a given week) ──
  async function unassignedStudents(query: Record<string, any>) {
    const session = query.session; // MORNING or AFTERNOON
    const weekOf = query.weekOf;  // date string e.g. "2025-03-17"

    if (!weekOf) return [];

    const weekStart = new Date(weekOf);
    const weekEnd = new Date(weekOf);
    weekEnd.setDate(weekEnd.getDate() + 4); // Friday

    // Find all active booking courses whose dates overlap this week
    const sessionCategories: string[] = [];
    if (session === 'MORNING') sessionCategories.push('MORNING', 'MORNING_PLUS', 'INTENSIVE');
    else if (session === 'AFTERNOON') sessionCategories.push('AFTERNOON', 'AFTERNOON_PLUS', 'INTENSIVE');
    else sessionCategories.push('MORNING', 'MORNING_PLUS', 'AFTERNOON', 'AFTERNOON_PLUS', 'INTENSIVE', 'PRIVATE', 'OTHER');

    const bookingCourses = await prisma.bookingCourse.findMany({
      where: {
        active: true,
        category: { in: sessionCategories as any },
        startDate: { lte: weekEnd },
        endDate: { gte: weekStart },
      },
      include: {
        booking: {
          include: { student: { select: { id: true, firstName: true, lastName: true, currentLevel: true, nationality: true } } }
        },
        classAssignments: {
          where: {
            weekStart: { lte: weekEnd },
            OR: [
              { weekEnd: null },
              { weekEnd: { gte: weekStart } },
            ],
          },
        },
      },
    });

    // Return only those with no overlapping class assignment for this week
    return bookingCourses.filter(bc => bc.classAssignments.length === 0);
  }

  // ── Class teachers (default assignment) ─────
  async function getClassTeachers(classId: number) {
    return prisma.classTeacher.findMany({
      where: { classId },
      include: { teacher: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async function assignClassTeacher(data: Record<string, any>) {
    return prisma.classTeacher.create({
      data: {
        classId: parseInt(data.classId),
        teacherId: parseInt(data.teacherId),
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      } as any,
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

  // ── Teachers ────────────────────────────────
  async function listTeachers() {
    return prisma.teacher.findMany({ where: { active: true }, orderBy: { lastName: 'asc' } });
  }

  async function createTeacher(data: Record<string, any>) {
    return prisma.teacher.create({ data: data as any });
  }

  async function updateTeacher(id: number, data: Record<string, any>) {
    return prisma.teacher.update({ where: { id }, data: data as any });
  }

  async function deleteTeacher(id: number) {
    return prisma.teacher.delete({ where: { id } });
  }

  return {
    listClassrooms,
    listClasses, getClassById, createClass, updateClass, deleteClass,
    assignStudent, removeAssignment, unassignedStudents,
    getClassTeachers, assignClassTeacher, removeClassTeacher,
    getCovers, createCover, removeCover,
    listTeachers, createTeacher, updateTeacher, deleteTeacher,
  };
}
