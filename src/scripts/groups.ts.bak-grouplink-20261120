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

  // Age for display: from a real birthday if we have one, else the raw age we
  // stashed in `note` at group import ("Age at intake: N") when only an age was
  // given — we keep birthday null in that case so the passport reader can still
  // fill the exact DOB later.
  function ageFromStudent(birthday: Date | null, note: string | null): number | null {
    if (birthday) {
      const d = new Date(birthday);
      let a = new Date().getUTCFullYear() - d.getUTCFullYear();
      const m = new Date().getUTCMonth() - d.getUTCMonth();
      if (m < 0 || (m === 0 && new Date().getUTCDate() < d.getUTCDate())) a--;
      return a >= 0 && a < 120 ? a : null;
    }
    const m = (note || '').match(/age at intake:\s*(\d{1,3})/i);
    return m ? parseInt(m[1], 10) : null;
  }

  /** Overview list — one row per group, member count only (no student detail — perf). */
  async function listGroups(opts: { upcomingOnly?: boolean; agencyId?: number } = {}) {
    const groups = await prisma.studentGroup.findMany({
      where: opts.agencyId ? { agencyId: opts.agencyId } : undefined,
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
      activitiesPack: g.activitiesPack,
      courseName: g.courseName,
      courseStart: g.courseStart,
      courseEnd: g.courseEnd,
      accomType: g.accomType,
      accomStart: g.accomStart,
      accomEnd: g.accomEnd,
      hubspotDealId: g.hubspotDealId,
      agencyId: g.agencyId,
      // Status mirrors the invoice: an invoice number means it's been billed;
      // otherwise it's still a skeletal group created off the deal.
      hubspotInvoiceNumber: g.hubspotInvoiceNumber,
      status: g.hubspotInvoiceNumber ? 'Invoiced' : 'Pending',
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
        student: { select: { id: true, firstName: true, lastName: true, birthday: true, currentLevel: true, nationality: true, email: true, phone: true, gender: true, note: true, hubspotContactId: true } },
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
        age: ageFromStudent(b.student?.birthday || null, b.student?.note || null),
        gender: b.student?.gender === 1 ? 'male' : b.student?.gender === 2 ? 'female' : null,
        phone: b.student?.phone || null,
        level: b.student?.currentLevel || null,
        nationality: b.student?.nationality || null,
        email: (b.student?.email || '').includes('@grp-') ? null : (b.student?.email || null),
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
    students: Array<{ fullName?: string; firstName?: string; lastName?: string; dob?: string | null; age?: number | string | null; levelCEFR?: string | null; gender?: string | null; nationality?: string | null; email?: string | null; phone?: string | null }>,
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
      // Use a provided email as-is (juniors may legitimately share a parent's
      // address — email isn't unique in SIS). Only synth a placeholder when none
      // was given, so the record still has a stable key.
      const provided = (s.email || '').trim();
      const email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(provided) ? provided : synthEmail(first, last, g.hubspotDealId, used);
      const level = s.levelCEFR || null;
      // Age handling: a real DOB wins. If only an age was given, stash it in `note`
      // and leave birthday null so the passport reader can fill the exact DOB later.
      const ageNum = (s.age != null && String(s.age).trim() !== '') ? parseInt(String(s.age), 10) : NaN;
      const note = (!s.dob && !isNaN(ageNum)) ? `Age at intake: ${ageNum} (group import)` : null;
      const student = await prisma.student.create({
        data: {
          firstName: first, lastName: last || null, email,
          phone: (s.phone || '').trim() || null,
          gender: s.gender === 'male' ? 1 : s.gender === 'female' ? 2 : null,
          birthday: s.dob ? new Date(s.dob + 'T00:00:00.000Z') : null,
          note,
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
