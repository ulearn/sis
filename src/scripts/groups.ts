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
import fs from 'fs';
import path from 'path';
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
        id: true, status: true, serviceStart: true, serviceEnd: true, groupRole: true,
        student: { select: { id: true, firstName: true, lastName: true, birthday: true, currentLevel: true, nationality: true, email: true, phone: true, gender: true, note: true, hubspotContactId: true, passportNumber: true, passportValidUntil: true } },
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
        role: b.groupRole || 'student',
        passportNumber: b.student?.passportNumber || null,
        passportExpiry: b.student?.passportValidUntil || null,
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

  // ── Same person, any door (Neil 2026-11-20) ───────────────────────────────
  // People reach a group by a pasted list / CSV (commitGroupStudents) or by the
  // passport link (addGroupMember), in any order and more than once. Before
  // creating anyone, look for them among the group's members:
  //  - same passport number → same person;
  //  - a different passport number already on file → different person;
  //  - otherwise compare names as accent-free word sets, in any order
  //    ("ROSSI MARIA GIULIA" = "Maria Rossi"): 2 shared words, or 1 shared word plus
  //    the same birth date AND a near-identical spelling of another word (not twins).
  //    Different birth dates → never the same person.
  // Only a single clear candidate counts; anything ambiguous is treated as new.
  const nameWords = (...parts: Array<string | null | undefined>) => new Set(
    parts.join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .split(/[^a-z]+/).filter(w => w.length >= 2 && w !== 'unreadable' && w !== 'passport'));
  function editDistance(a: string, b: string): number {
    const d = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = d[0]!; d[0] = i;
      for (let j = 1; j <= b.length; j++) { const t = d[j]!; d[j] = Math.min(d[j]! + 1, d[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; }
    }
    return d[b.length]!;
  }
  async function findGroupMatch(groupId: number, p: { firstName?: string | null; lastName?: string | null; dob?: string | null; passportNumber?: string | null }) {
    const rows = await prisma.booking.findMany({
      where: { groupId },
      select: { id: true, studentId: true, student: { select: { firstName: true, lastName: true, birthday: true, passportNumber: true } } },
    });
    const pp = (p.passportNumber || '').replace(/\s+/g, '').toUpperCase();
    if (pp) { const hit = rows.find(r => (r.student?.passportNumber || '').toUpperCase() === pp); if (hit) return { bookingId: hit.id, studentId: hit.studentId!, by: 'passport' as const }; }
    const want = nameWords(p.firstName, p.lastName);
    if (!want.size) return null;
    const hits = rows.filter(r => {
      const s = r.student; if (!s) return false;
      if (pp && s.passportNumber && s.passportNumber.toUpperCase() !== pp) return false;
      const dobA = s.birthday ? new Date(s.birthday).toISOString().slice(0, 10) : null;
      if (dobA && p.dob && dobA !== p.dob) return false;
      const have = nameWords(s.firstName, s.lastName);
      const shared = [...want].filter(w => have.has(w)).length;
      if (shared >= 2) return true;
      // 1 shared word + same birth date only with a near-identical spelling of the rest
      // (Paiardini/Pajardini). Twins share a surname and a birth date but not a first name.
      if (shared === 1 && !!dobA && dobA === p.dob) {
        const restA = [...have].filter(w => !want.has(w)), restB = [...want].filter(w => !have.has(w));
        return restA.some(a => restB.some(b => editDistance(a, b) <= Math.max(1, Math.floor(Math.min(a.length, b.length) / 5))));
      }
      return false;
    });
    return hits.length === 1 ? { bookingId: hits[0]!.id, studentId: hits[0]!.studentId!, by: 'name' as const } : null;
  }

  /**
   * Commit reviewed parsed rows → real SIS Student + Booking + BookingCourse per
   * member (Neil's model): financials €0 (nothing blocks / no chasing a junior),
   * provisional level onto BOTH the student's currentLevel (Learning-section) AND
   * booking_course.level (the operable placement fallback until they're tested).
   * Re-runnable: anyone already in the group (see findGroupMatch) is skipped, so a
   * re-click, a second list, or a list after passports were uploaded adds only the new people.
   */
  async function commitGroupStudents(
    groupId: number,
    students: Array<{ fullName?: string; firstName?: string; lastName?: string; dob?: string | null; age?: number | string | null; levelCEFR?: string | null; gender?: string | null; nationality?: string | null; email?: string | null; phone?: string | null }>,
    opts: { createdBy?: string | null } = {},
  ) {
    const g = await prisma.studentGroup.findUnique({ where: { id: groupId } });
    if (!g) throw new Error('Group not found');
    if (!students.length) throw new Error('No students to create');

    const isJunior = /junior/i.test(g.groupType || '');
    const weeks = g.courseStart && g.courseEnd
      ? Math.max(1, Math.round((+g.courseEnd - +g.courseStart) / (7 * 86400000))) : 1;
    const existingEmails = await prisma.booking.findMany({ where: { groupId }, select: { student: { select: { email: true } } } });
    const used = new Set<string>(existingEmails.map(b => b.student?.email || '').filter(Boolean));
    const created: Array<{ studentId: number; bookingId: number; name: string; email: string }> = [];
    const skipped: Array<{ name: string; bookingId: number }> = [];

    for (const s of students) {
      const first = (s.firstName || (s.fullName || '').split(/\s+/)[0] || 'Student').trim();
      const last = (s.lastName || (s.fullName || '').split(/\s+/).slice(1).join(' ') || '').trim();
      const already = await findGroupMatch(groupId, { firstName: first, lastName: last, dob: s.dob || null });
      if (already) {
        // Fill only what the existing record lacks (a passport-read record already has the legal name/DOB).
        const cur = await prisma.student.findUnique({ where: { id: already.studentId }, select: { phone: true, currentLevel: true, nationality: true, email: true } });
        const fill: any = {};
        if (!cur?.phone && s.phone) fill.phone = String(s.phone).trim();
        if (!cur?.currentLevel && s.levelCEFR) fill.currentLevel = s.levelCEFR;
        if (!cur?.nationality && s.nationality) fill.nationality = s.nationality;
        const em = (s.email || '').trim();
        if (/@grp-/.test(cur?.email || '') && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) fill.email = em;
        if (Object.keys(fill).length) await prisma.student.update({ where: { id: already.studentId }, data: fill });
        if (s.levelCEFR) await prisma.bookingCourse.updateMany({ where: { bookingId: already.bookingId, level: null }, data: { level: s.levelCEFR } });
        skipped.push({ name: `${first} ${last}`.trim(), bookingId: already.bookingId });
        continue;
      }
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
    return { created, skipped, group: g };
  }

  // ── Group link (public, no login): one member per passport ───────────────
  // Neil 2026-11-20: groups (often juniors, no emails) need names + DOB + passports
  // for flights. The organiser uploads passports on /sis/group/<token>; each
  // passport becomes a member here. Leaders (groupRole 'leader') need flights too
  // but no class, so they get no BookingCourse and aren't pushed to HubSpot.
  const titleCase = (s: string | null | undefined) => String(s || '').trim().toLowerCase()
    .replace(/(^|[\s\-'’])(\p{L})/gu, (_m, p1, p2) => p1 + p2.toUpperCase());
  const isoDay = (d: string | null | undefined) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) ? new Date(d + 'T00:00:00.000Z') : null;

  async function addGroupMember(groupId: number, m: {
    firstName?: string | null; lastName?: string | null; dob?: string | null; sex?: string | null;
    nationality?: string | null; passportNumber?: string | null; passportIssued?: string | null; passportExpiry?: string | null;
    docType?: 'passport' | 'id_card' | null;
    role?: 'student' | 'leader';
  }, opts: { bookingId?: number } = {}) {
    const g = await prisma.studentGroup.findUnique({ where: { id: groupId } });
    if (!g) throw new Error('Group not found');
    const leader = m.role === 'leader';
    const first = titleCase(m.firstName) || 'Unreadable';
    const last = titleCase(m.lastName) || (m.firstName ? '' : 'passport');
    // Already in the group (pasted list, earlier upload)? The passport completes that
    // record — its name, birth date and passport details are the legal ones.
    // Uploaded on a specific person's row → that person, whatever the names say.
    let already: { bookingId: number; studentId: number; by: 'passport' | 'name' | 'row' } | null = null;
    if (opts.bookingId) {
      const b = await prisma.booking.findFirst({ where: { id: opts.bookingId, groupId }, select: { id: true, studentId: true } });
      if (!b?.studentId) throw new Error('Not in this group');
      already = { bookingId: b.id, studentId: b.studentId, by: 'row' };
    } else already = await findGroupMatch(groupId, m);
    if (already) {
      const data: any = {};
      if (m.firstName) data.firstName = first;
      if (m.lastName) data.lastName = last || null;
      if (isoDay(m.dob)) data.birthday = isoDay(m.dob);
      if (m.sex === 'M' || m.sex === 'F') data.gender = m.sex === 'M' ? 1 : 2;
      if (m.nationality) data.nationality = m.nationality;
      if (m.passportNumber) data.passportNumber = m.passportNumber.trim();
      if (isoDay(m.passportIssued)) data.passportValidFrom = isoDay(m.passportIssued);
      if (isoDay(m.passportExpiry)) data.passportValidUntil = isoDay(m.passportExpiry);
      if (m.docType) data.travelDocType = m.docType;
      if (Object.keys(data).length) await prisma.student.update({ where: { id: already.studentId }, data });
      return { studentId: already.studentId, bookingId: already.bookingId, matched: already.by };
    }
    const existing = await prisma.booking.findMany({ where: { groupId }, select: { student: { select: { email: true } } } });
    const used = new Set(existing.map(b => b.student?.email || '').filter(Boolean));
    const student = await prisma.student.create({
      data: {
        firstName: first, lastName: last || null,
        email: synthEmail(first, last, g.hubspotDealId, used),
        gender: m.sex === 'M' ? 1 : m.sex === 'F' ? 2 : null,
        birthday: isoDay(m.dob),
        nationality: m.nationality || null,
        passportNumber: (m.passportNumber || '').trim() || null,
        passportValidFrom: isoDay(m.passportIssued),
        passportValidUntil: isoDay(m.passportExpiry),
        travelDocType: m.docType || null,
        studentType: (!leader && /junior/i.test(g.groupType || '')) ? ('JUNIOR' as any) : ('ADULT' as any),
        note: leader ? `Group leader — ${g.name}` : null,
      },
    });
    const booking = await prisma.booking.create({
      data: {
        studentId: student.id, groupId, agencyId: g.agencyId, groupRole: leader ? 'leader' : null,
        status: 'CONFIRMED' as any, serviceStart: g.courseStart, serviceEnd: g.courseEnd,
        amountTotal: 0, amountPaid: 0, amountOpen: 0, dataSource: 'MANUAL' as any,
      },
    });
    if (!leader) {
      const weeks = g.courseStart && g.courseEnd ? Math.max(1, Math.round((+g.courseEnd - +g.courseStart) / (7 * 86400000))) : 1;
      await prisma.bookingCourse.create({
        data: { bookingId: booking.id, name: g.courseName || 'General English Junior', category: 'MORNING' as any, level: null,
                startDate: g.courseStart, endDate: g.courseEnd, weeks, hoursPerWeek: 15 },
      });
    }
    return { studentId: student.id, bookingId: booking.id, matched: null as null | 'passport' | 'name' | 'row' };
  }

  // Members with the passport fields the airline needs (link table + manifest).
  async function groupTravellers(groupId: number) {
    const g = await prisma.studentGroup.findUnique({ where: { id: groupId } });
    if (!g) return null;
    const rows = await prisma.booking.findMany({
      where: { groupId },
      select: { id: true, groupRole: true, student: { select: { id: true, firstName: true, lastName: true, birthday: true, gender: true, nationality: true, passportNumber: true, passportValidUntil: true, travelDocType: true,
        documents: { where: { category: 'passport' }, select: { id: true }, orderBy: { id: 'asc' } } } } },
      orderBy: { id: 'asc' },
    });
    const day = (d: Date | null | undefined) => d ? new Date(d).toISOString().slice(0, 10) : null;
    // Many countries require a passport valid 3+ months past the stay; flag anything shorter.
    const needUntil = g.courseEnd || g.accomEnd ? new Date(+(g.courseEnd || g.accomEnd)! + 90 * 86400000) : null;
    return {
      group: g,
      members: rows.map(b => {
        const s: any = b.student || {};
        const r = {
          bookingId: b.id, studentId: s.id, role: b.groupRole === 'leader' ? 'leader' : 'student',
          firstName: s.firstName === 'Unreadable' ? '' : (s.firstName || ''), lastName: s.lastName === 'passport' ? '' : (s.lastName || ''),
          dob: day(s.birthday), sex: s.gender === 1 ? 'M' : s.gender === 2 ? 'F' : '',
          nationality: s.nationality || '', docType: s.travelDocType || '', passportNumber: s.passportNumber || '', passportExpiry: day(s.passportValidUntil),
          passportDocId: s.documents?.[0]?.id || null,
          docIds: (s.documents || []).map((d: any) => d.id),   // ID cards: front + back
        };
        // Neil 2026-11-20: what's needed is name, birth date, sex and the document number.
        const missing = (['firstName', 'lastName', 'dob', 'sex', 'passportNumber'] as const).filter(k => !r[k]);
        const expiresSoon = !!(r.passportExpiry && needUntil && new Date(r.passportExpiry + 'T00:00:00Z') < needUntil);
        return { ...r, missing, expiresSoon };
      }),
    };
  }

  async function updateGroupMember(groupId: number, bookingId: number, f: any) {
    const b = await prisma.booking.findFirst({ where: { id: bookingId, groupId }, select: { id: true, studentId: true, groupRole: true } });
    if (!b) throw new Error('Not in this group');
    const data: any = {};
    if ('firstName' in f) data.firstName = titleCase(f.firstName) || 'Unreadable';
    if ('lastName' in f) data.lastName = titleCase(f.lastName) || null;
    if ('dob' in f) data.birthday = isoDay(f.dob);
    if ('sex' in f) data.gender = f.sex === 'M' ? 1 : f.sex === 'F' ? 2 : null;
    if ('nationality' in f) data.nationality = String(f.nationality || '').trim() || null;
    if ('passportNumber' in f) data.passportNumber = String(f.passportNumber || '').trim().toUpperCase() || null;
    if ('passportExpiry' in f) data.passportValidUntil = isoDay(f.passportExpiry);
    if ('docType' in f) data.travelDocType = f.docType === 'id_card' || f.docType === 'passport' ? f.docType : null;
    if (Object.keys(data).length) await prisma.student.update({ where: { id: b.studentId! }, data });
    if ('role' in f) {
      const leader = f.role === 'leader';
      if (leader !== (b.groupRole === 'leader')) {
        await prisma.booking.update({ where: { id: b.id }, data: { groupRole: leader ? 'leader' : null } });
        const gt = (await prisma.studentGroup.findUnique({ where: { id: groupId }, select: { groupType: true } }))?.groupType || '';
        await prisma.student.update({ where: { id: b.studentId! }, data: { studentType: (!leader && /junior/i.test(gt)) ? ('JUNIOR' as any) : ('ADULT' as any) } });
        if (leader) await prisma.bookingCourse.deleteMany({ where: { bookingId: b.id } });
        else {
          const g = await prisma.studentGroup.findUnique({ where: { id: groupId } });
          await prisma.bookingCourse.create({ data: { bookingId: b.id, name: g?.courseName || 'General English Junior', category: 'MORNING' as any, level: null, startDate: g?.courseStart, endDate: g?.courseEnd, weeks: 1, hoursPerWeek: 15 } });
        }
      }
    }
    return { success: true };
  }

  // Remove a member added by mistake: their booking, and the student too when
  // they have no other booking (a group-intake student has nothing else).
  async function removeGroupMember(groupId: number, bookingId: number) {
    const b = await prisma.booking.findFirst({ where: { id: bookingId, groupId }, select: { id: true, studentId: true } });
    if (!b) throw new Error('Not in this group');
    // FKs onto bookings/students are RESTRICT, so clear the dependants first.
    await prisma.$transaction([
      prisma.bookingCourse.deleteMany({ where: { bookingId: b.id } }),
      prisma.bookingStatusHistory.deleteMany({ where: { bookingId: b.id } }),
      prisma.booking.delete({ where: { id: b.id } }),
    ]);
    if (b.studentId && (await prisma.booking.count({ where: { studentId: b.studentId } })) === 0) {
      await prisma.studentDocument.deleteMany({ where: { studentId: b.studentId } });
      // The passport image goes too — a traveller added by mistake leaves nothing behind.
      fs.rmSync(path.join(__dirname, '..', '..', 'uploads', 'students', String(b.studentId)), { recursive: true, force: true });
      await prisma.student.delete({ where: { id: b.studentId } }).catch((e: any) => console.warn('[group-link] student delete', b.studentId, e?.message || e));
    }
    return { success: true };
  }

  return { listGroups, getGroup, commitGroupStudents, addGroupMember, groupTravellers, updateGroupMember, removeGroupMember };
}
