/**
 * Group Management — closed / junior groups (a school or agent sending N students
 * on one HubSpot deal). Phase 1: read-only overview + drill-in roster.
 *
 * Design (Neil, 2026-08-14):
 *   · The GROUP is the operable unit; each member is a real Booking (group_id) so
 *     class assignment / attendance / LoA work per student.
 *   · Financials live ONLY at the group level — one HubSpot invoice to the sending
 *     entity. Member bookings carry €0 (nothing to chase a 15-yr-old for, and a
 *     zero balance never blocks placement/assignment).
 *   · Overview sorts by NEAREST ARRIVAL = accom start, falling back to course
 *     start (they arrive into accommodation before Monday's course start).
 */
import type { PrismaClient } from '../generated/prisma/client';

export function groupScripts(prisma: PrismaClient) {

  // Arrival = accom start if present, else course start. Used for sort + display.
  const arrivalOf = (g: { accomStart: Date | null; courseStart: Date | null }) =>
    g.accomStart ?? g.courseStart ?? null;

  /** Overview list — one row per group, member count only (no student detail — perf). */
  async function listGroups(opts: { upcomingOnly?: boolean } = {}) {
    const groups = await prisma.studentGroup.findMany({
      include: { _count: { select: { bookings: true } } },
    });
    const now = new Date();
    const rows = groups.map(g => ({
      id: g.id,
      name: g.name,
      company: g.company,
      contactName: g.contactName,
      contactEmail: g.contactEmail,
      pax: g.pax,
      membersLoaded: g._count.bookings,
      leaders: g.leaders,
      groupType: g.groupType,
      courseName: g.courseName,
      courseStart: g.courseStart,
      courseEnd: g.courseEnd,
      accomType: g.accomType,
      accomStart: g.accomStart,
      accomEnd: g.accomEnd,
      hubspotDealId: g.hubspotDealId,
      arrival: arrivalOf(g),
    }));
    // Sort by nearest arrival (accom start, else course start); nulls last.
    rows.sort((a, b) => {
      const ta = a.arrival ? +new Date(a.arrival) : Infinity;
      const tb = b.arrival ? +new Date(b.arrival) : Infinity;
      return ta - tb;
    });
    const withUpcoming = opts.upcomingOnly
      ? rows.filter(r => {
          const end = r.courseEnd || r.accomEnd || r.arrival;
          return !end || +new Date(end) >= +now - 24 * 3600 * 1000;
        })
      : rows;
    return withUpcoming;
  }

  /** Group detail + roster (member bookings → student). */
  async function getGroup(id: number) {
    const g = await prisma.studentGroup.findUnique({ where: { id } });
    if (!g) return null;
    const bookings = await prisma.booking.findMany({
      where: { groupId: id },
      select: {
        id: true, status: true, serviceStart: true, serviceEnd: true,
        student: { select: { id: true, firstName: true, lastName: true, birthday: true, currentLevel: true, nationality: true, email: true, hubspotContactId: true } },
        courses: { select: { name: true, category: true }, take: 1 },
      },
      orderBy: { id: 'asc' },
    });
    return {
      group: { ...g, arrival: arrivalOf(g) },
      roster: bookings.map(b => ({
        bookingId: b.id,
        status: b.status,
        studentId: b.student?.id,
        name: `${b.student?.firstName || ''} ${b.student?.lastName || ''}`.trim(),
        dob: b.student?.birthday || null,
        level: b.student?.currentLevel || null,
        nationality: b.student?.nationality || null,
        email: b.student?.email || null,
        hubspotContactId: b.student?.hubspotContactId || null,
        course: b.courses?.[0]?.name || null,
      })),
    };
  }

  // Synthetic placeholder email for a junior with no real address. Accent-folded,
  // unique within the group. HubSpot/SIS key on email; juniors don't have one.
  function synthEmail(first: string, last: string, dealId: string | null, used: Set<string>): string {
    const slug = (s: string) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    const base = `${slug(first)}.${slug(last) || 'student'}`;
    let email = `${base}@grp-${dealId || 'x'}.ulearnstudent.com`, n = 1;
    while (used.has(email)) email = `${base}${++n}@grp-${dealId || 'x'}.ulearnstudent.com`;
    used.add(email);
    return email;
  }

  /**
   * Commit reviewed parsed rows → real SIS Student + Booking + BookingCourse per
   * member (Neil's model): financials €0 (nothing blocks / no chasing a junior),
   * provisional level onto BOTH the student's currentLevel (Learning-section) AND
   * booking_course.level (the operable placement fallback until they're tested).
   * Refuses if the group already has members (avoids double-commit on re-click).
   */
  async function commitGroupStudents(
    groupId: number,
    students: Array<{ fullName?: string; firstName?: string; lastName?: string; dob?: string | null; levelCEFR?: string | null; gender?: string | null; nationality?: string | null }>,
    opts: { createdBy?: string | null } = {},
  ) {
    const g = await prisma.studentGroup.findUnique({ where: { id: groupId } });
    if (!g) throw new Error('Group not found');
    const existing = await prisma.booking.count({ where: { groupId } });
    if (existing > 0) throw new Error(`Group already has ${existing} member(s) — clear them before re-importing`);
    if (!students.length) throw new Error('No students to create');

    const isJunior = /junior/i.test(g.groupType || '');
    const weeks = g.courseStart && g.courseEnd
      ? Math.max(1, Math.round((+g.courseEnd - +g.courseStart) / (7 * 86400000))) : 1;
    const used = new Set<string>();
    const created: Array<{ studentId: number; bookingId: number; name: string; email: string }> = [];

    for (const s of students) {
      const first = (s.firstName || (s.fullName || '').split(/\s+/)[0] || 'Student').trim();
      const last = (s.lastName || (s.fullName || '').split(/\s+/).slice(1).join(' ') || '').trim();
      const email = synthEmail(first, last, g.hubspotDealId, used);
      const level = s.levelCEFR || null;
      const student = await prisma.student.create({
        data: {
          firstName: first, lastName: last || null, email,
          gender: s.gender === 'male' ? 1 : s.gender === 'female' ? 2 : null,
          birthday: s.dob ? new Date(s.dob + 'T00:00:00.000Z') : null,
          nationality: s.nationality || null,
          currentLevel: level,                       // Learning-section starting level (provisional)
          studentType: isJunior ? ('JUNIOR' as any) : ('ADULT' as any),
        },
      });
      // NB: member bookings do NOT carry the HubSpot deal id — that's UNIQUE per
      // booking (one deal ↔ one booking, relied on by the invoice webhook) and the
      // whole GROUP shares one deal. The group row owns the deal; members link via
      // group_id. Financials live at the group/deal level, so member bookings are €0.
      const booking = await prisma.booking.create({
        data: {
          studentId: student.id, groupId, agencyId: g.agencyId,
          status: 'CONFIRMED' as any,
          serviceStart: g.courseStart, serviceEnd: g.courseEnd,
          amountTotal: 0, amountPaid: 0, amountOpen: 0, dataSource: 'MANUAL' as any,
        },
      });
      await prisma.bookingCourse.create({
        data: {
          bookingId: booking.id, name: g.courseName || 'General English Junior',
          category: 'MORNING' as any, level,          // operable placement fallback
          startDate: g.courseStart, endDate: g.courseEnd, weeks, hoursPerWeek: 15,
        },
      });
      created.push({ studentId: student.id, bookingId: booking.id, name: `${first} ${last}`.trim(), email });
    }
    return { created, group: g };
  }

  return { listGroups, getGroup, commitGroupStudents };
}
