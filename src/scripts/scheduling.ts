import { PrismaClient } from '../generated/prisma/client';

/**
 * Scheduling: materialises ClassOccurrence rows from the recurring Class templates.
 *
 * Classes store abstract recurring schedules (e.g. "Mon–Fri 09:00–12:15"); occurrences
 * are the concrete per-day instances that attendance, payroll, covers, and cancellations
 * hang off. This module generates them idempotently on demand.
 *
 * Runs automatically on:
 *   - Server startup (topping up current week + next 8 weeks)
 *   - Class create/update (regenerating that class's future occurrences)
 *   - SchoolClosure create/update (removing occurrences inside the closure window)
 *   - Payroll refresh (as a safety net before calculating hours)
 */

export function schedulingScripts(prisma: PrismaClient) {

  /**
   * Generate occurrences for all active classes across a date range.
   * Skips dates that fall inside any school closure. Idempotent — safe to re-run.
   *
   * Private/121 classes: occurrences are emitted only for dates with at least one
   * active StudentClassAssignment overlap. This is the root-cause fix for the
   * "Wanyu sits in 121 forever and generates phantom 14:00–16:00 daily slots after
   * her course ended" class of bug. A private class is a per-student container —
   * it has no inherent schedule independent of its enrolments. Group classes are
   * unaffected and continue to materialise on their day-of-week pattern.
   */
  async function generateOccurrences(from: Date, to: Date) {
    const fromD = new Date(from); fromD.setHours(0, 0, 0, 0);
    const toD = new Date(to); toD.setHours(0, 0, 0, 0);

    const classes = await prisma.class.findMany({ where: { active: true } });
    const closures = await prisma.schoolClosure.findMany();

    // Pull active StudentClassAssignment windows for any private class once,
    // grouped by classId. Used below to gate occurrence generation per date.
    const privateClassIds = classes.filter(c => (c as any).isPrivate === true).map(c => c.id);
    const privateBookings = privateClassIds.length
      ? await prisma.studentClassAssignment.findMany({
          where: {
            classId: { in: privateClassIds },
            weekStart: { lte: toD },
            OR: [{ weekEnd: null }, { weekEnd: { gte: fromD } }],
          },
          select: { classId: true, weekStart: true, weekEnd: true },
        })
      : [];
    // Compare dates as YYYY-MM-DD strings to avoid TZ pitfalls. Prisma reads DATE
    // columns as UTC-midnight Date objects; the JS iterator below is local-midnight.
    // In any TZ east of UTC (Ireland is BST = UTC+1 in summer) the raw `>=` / `<=`
    // comparisons disagreed by a day at boundaries. ISO strings sidestep this
    // entirely and are how scheduling state is stored anyway (DATE, no time).
    const isoOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const isoOfUtc = (d: Date) => d.toISOString().slice(0, 10);

    const bookingsByClass: Record<number, Array<{ startIso: string; endIso: string | null }>> = {};
    for (const b of privateBookings) {
      (bookingsByClass[b.classId] ||= []).push({
        startIso: isoOfUtc(new Date(b.weekStart)),
        endIso: b.weekEnd ? isoOfUtc(new Date(b.weekEnd)) : null,
      });
    }
    const hasActiveBooking = (classId: number, dIso: string) =>
      (bookingsByClass[classId] || []).some(w =>
        dIso >= w.startIso && (!w.endIso || dIso <= w.endIso)
      );

    // Only UNPAID closures suppress occurrence generation. Paid bank holidays
    // still produce occurrences so payroll can pay the default teacher.
    const closureWindows = closures
      .filter(c => !(c as any).isPaidHoliday)
      .map(c => ({ startIso: isoOfUtc(new Date(c.startDate)), endIso: isoOfUtc(new Date(c.endDate)) }));
    const inClosure = (dIso: string) => closureWindows.some(c => dIso >= c.startIso && dIso <= c.endIso);

    let created = 0;
    let skippedClosure = 0;
    let skippedExisting = 0;
    let skippedNoBooking = 0;

    for (const cls of classes) {
      const dayCodes: number[] = (cls.days as any as number[]) || [];
      if (dayCodes.length === 0) continue;
      const isPrivate = (cls as any).isPrivate === true;

      for (let d = new Date(fromD); d <= toD; d.setDate(d.getDate() + 1)) {
        // getDay: 0=Sun, 1=Mon ... 6=Sat — matches our [1..5] convention
        if (!dayCodes.includes(d.getDay())) continue;
        const dIso = isoOf(d);
        if (inClosure(dIso)) { skippedClosure++; continue; }
        if (isPrivate && !hasActiveBooking(cls.id, dIso)) { skippedNoBooking++; continue; }

        // Idempotent upsert on the (classId, date) unique constraint
        const dateOnly = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        try {
          const existing = await prisma.classOccurrence.findUnique({
            where: { classId_date: { classId: cls.id, date: dateOnly } },
          });
          if (existing) { skippedExisting++; continue; }
          await prisma.classOccurrence.create({
            data: { classId: cls.id, date: dateOnly, cancelled: false },
          });
          created++;
        } catch (e) {
          // Race condition safety — treat as existing
          skippedExisting++;
        }
      }
    }

    return { created, skippedClosure, skippedExisting, skippedNoBooking, classesProcessed: classes.length };
  }

  /** Regenerate occurrences for a single class from today forward (8 weeks).
   *  Honours the same private-class enrolment gate as generateOccurrences. */
  async function regenerateForClass(classId: number) {
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls || !cls.active) return { created: 0 };

    const from = new Date(); from.setHours(0, 0, 0, 0);
    const to = new Date(from); to.setDate(to.getDate() + 7 * 8);

    const isoOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const isoOfUtc = (d: Date) => d.toISOString().slice(0, 10);

    const closures = await prisma.schoolClosure.findMany();
    const closureWindows = closures
      .filter(c => !(c as any).isPaidHoliday)
      .map(c => ({ startIso: isoOfUtc(new Date(c.startDate)), endIso: isoOfUtc(new Date(c.endDate)) }));
    const inClosure = (dIso: string) => closureWindows.some(c => dIso >= c.startIso && dIso <= c.endIso);

    const isPrivate = (cls as any).isPrivate === true;
    const bookings = isPrivate
      ? await prisma.studentClassAssignment.findMany({
          where: {
            classId: cls.id,
            weekStart: { lte: to },
            OR: [{ weekEnd: null }, { weekEnd: { gte: from } }],
          },
          select: { weekStart: true, weekEnd: true },
        })
      : [];
    const bookingWindows = bookings.map(b => ({
      startIso: isoOfUtc(new Date(b.weekStart)),
      endIso: b.weekEnd ? isoOfUtc(new Date(b.weekEnd)) : null,
    }));
    const hasActiveBooking = (dIso: string) =>
      bookingWindows.some(b => dIso >= b.startIso && (!b.endIso || dIso <= b.endIso));

    const dayCodes: number[] = (cls.days as any as number[]) || [];
    if (dayCodes.length === 0) return { created: 0 };

    let created = 0;
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (!dayCodes.includes(d.getDay())) continue;
      const dIso = isoOf(d);
      if (inClosure(dIso)) continue;
      if (isPrivate && !hasActiveBooking(dIso)) continue;
      const dateOnly = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const existing = await prisma.classOccurrence.findUnique({
        where: { classId_date: { classId: cls.id, date: dateOnly } },
      });
      if (existing) continue;
      await prisma.classOccurrence.create({
        data: { classId: cls.id, date: dateOnly, cancelled: false },
      });
      created++;
    }
    return { created };
  }

  /**
   * Delete phantom occurrences for a private class — dates with no active
   * StudentClassAssignment overlap. Safe-deletes only: occurrences with any
   * teacher_assignment or teacher_cover dependency are skipped (those FKs are
   * RESTRICT, and a populated assignment usually means a real-world correction
   * happened that we shouldn't bulldoze).
   *
   * Called after assignStudent / endAssignment to keep the schedule honest.
   */
  async function cleanupPrivateClassOccurrences(classId: number) {
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls || (cls as any).isPrivate !== true) return { deleted: 0, kept: 0 };

    const bookings = await prisma.studentClassAssignment.findMany({
      where: { classId },
      select: { weekStart: true, weekEnd: true },
    });

    // No date floor — we trust the dependent-row check (teacher_assignments,
    // teacher_covers) to protect any historically meaningful occurrence.
    const occurrences = await prisma.classOccurrence.findMany({
      where: { classId },
      include: {
        teacherAssignments: { select: { id: true } },
      },
    });

    let deleted = 0, kept = 0;
    for (const occ of occurrences) {
      const occDate = new Date(occ.date);
      const inWindow = bookings.some(b =>
        occDate >= new Date(b.weekStart) &&
        (!b.weekEnd || occDate <= new Date(b.weekEnd))
      );
      if (inWindow) { kept++; continue; }
      if (occ.teacherAssignments.length > 0) { kept++; continue; }
      const covers = await prisma.teacherCover.count({ where: { classId, date: occ.date } });
      if (covers > 0) { kept++; continue; }
      await prisma.classOccurrence.delete({ where: { id: occ.id } });
      deleted++;
    }
    return { deleted, kept };
  }

  /** Delete future occurrences that fall inside an UNPAID closure window.
   *  Paid bank holidays keep their occurrences so payroll can include them. */
  async function removeOccurrencesInClosure(closureId: number) {
    const closure = await prisma.schoolClosure.findUnique({ where: { id: closureId } });
    if (!closure) return { deleted: 0 };
    if ((closure as any).isPaidHoliday) return { deleted: 0 };

    const result = await prisma.classOccurrence.deleteMany({
      where: {
        date: { gte: closure.startDate, lte: closure.endDate },
      },
    });
    return { deleted: result.count };
  }

  /** Boot-time top-up: ensures current week + next 8 weeks are materialised. */
  async function ensureUpcomingOccurrences() {
    const from = new Date(); from.setHours(0, 0, 0, 0);
    // Snap to Monday of current week
    const day = from.getDay();
    const diff = from.getDate() - day + (day === 0 ? -6 : 1);
    from.setDate(diff);
    const to = new Date(from); to.setDate(to.getDate() + 7 * 9); // 9 weeks total

    return generateOccurrences(from, to);
  }

  // ── School closure CRUD ─────────────────────────
  async function listClosures() {
    return prisma.schoolClosure.findMany({ orderBy: { startDate: 'desc' } });
  }

  async function createClosure(data: { name: string; startDate: string; endDate: string; note?: string }) {
    const closure = await prisma.schoolClosure.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        note: data.note || null,
      },
    });
    await removeOccurrencesInClosure(closure.id);
    return closure;
  }

  async function updateClosure(id: number, data: { name?: string; startDate?: string; endDate?: string; note?: string }) {
    const patch: any = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.startDate) patch.startDate = new Date(data.startDate);
    if (data.endDate) patch.endDate = new Date(data.endDate);
    if (data.note !== undefined) patch.note = data.note;
    const closure = await prisma.schoolClosure.update({ where: { id }, data: patch });
    await removeOccurrencesInClosure(closure.id);
    return closure;
  }

  async function deleteClosure(id: number) {
    await prisma.schoolClosure.delete({ where: { id } });
    // Re-generate the window in case existing classes should now resume
    await ensureUpcomingOccurrences();
    return { deleted: true };
  }

  // ── Zoho Leave → OccurrenceAbsence sync ─────────
  /**
   * Read approved leave from Zoho People for every active non-salaried teacher with
   * a known email, intersect each leave window with class occurrences where that
   * teacher is the default class teacher, and write OccurrenceAbsence rows
   * (source='zoho'). Existing 'manual' rows are never touched. Existing 'zoho' rows
   * for occurrences that no longer have leave coverage are removed (leave was cancelled).
   *
   * Skipped: occurrences with an OccurrencePresenceOverride for the same teacher —
   * the DOS has overruled Zoho on that one.
   *
   * Returns counts so the caller can surface a meaningful status.
   */
  async function syncZohoLeaveToAbsences(from: Date | string, to: Date | string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const fromIso = fromDate.toISOString().split('T')[0];
    const toIso = toDate.toISOString().split('T')[0];

    const teachers = await prisma.teacher.findMany({
      where: { active: true, isSalaried: false, email: { not: null } },
      select: { id: true, email: true },
    });
    if (teachers.length === 0) {
      return { added: 0, removed: 0, skippedDueToOverride: 0, teachersChecked: 0, zohoOk: false };
    }

    // Fetch leave date sets for every teacher (cache-backed in zoho-leave-sync).
    const ZohoLeaveSync = require('./zoho-leave-sync');
    const sync = new ZohoLeaveSync({});
    const leaveByTeacher = new Map<number, Set<string>>();
    let zohoOk = true;
    for (const t of teachers) {
      try {
        const dates = await sync.getLeaveDates(t.email, fromIso, toIso);
        leaveByTeacher.set(t.id, dates);
      } catch (e) {
        zohoOk = false;
        leaveByTeacher.set(t.id, new Set());
        console.warn(`[zoho-sync] failed for teacher ${t.id}:`, (e as any).message);
      }
    }
    if (!zohoOk) {
      // Don't touch the absences table when Zoho is unreachable — preserves the
      // last-known state until Zoho is back.
      return { added: 0, removed: 0, skippedDueToOverride: 0, teachersChecked: teachers.length, zohoOk: false };
    }

    // Map default class teachers to their occurrence dates in the window.
    const classTeachers = await prisma.classTeacher.findMany({
      where: {
        startDate: { lte: toDate },
        OR: [{ endDate: null }, { endDate: { gte: fromDate } }],
      },
      select: { classId: true, teacherId: true, startDate: true, endDate: true },
    });
    const occurrences = await prisma.classOccurrence.findMany({
      where: { date: { gte: fromDate, lte: toDate }, cancelled: false },
      select: { id: true, classId: true, date: true },
    });

    // Build the desired set: { occurrenceId → teacherId } that should be on-leave.
    const desired = new Map<number, number>(); // occurrenceId → teacherId
    for (const occ of occurrences) {
      const occIso = occ.date.toISOString().split('T')[0];
      // Find default teacher for this occurrence's class on this date.
      const ct = classTeachers.find(c =>
        c.classId === occ.classId &&
        new Date(c.startDate) <= occ.date &&
        (!c.endDate || new Date(c.endDate) >= occ.date)
      );
      if (!ct) continue;
      const dates = leaveByTeacher.get(ct.teacherId);
      if (dates && dates.has(occIso)) desired.set(occ.id, ct.teacherId);
    }

    // Presence overrides — these win.
    const overrides = await prisma.occurrencePresenceOverride.findMany({
      where: { occurrence: { date: { gte: fromDate, lte: toDate } } },
      select: { occurrenceId: true, teacherId: true },
    });
    const overrideSet = new Set<string>(overrides.map(o => `${o.occurrenceId}-${o.teacherId}`));

    // Existing zoho-derived absences in this range
    const existingZohoAbsences = await prisma.occurrenceAbsence.findMany({
      where: {
        source: 'zoho',
        occurrence: { date: { gte: fromDate, lte: toDate } },
      },
      select: { id: true, occurrenceId: true, teacherId: true },
    });
    const existingByOccurrence = new Map<number, { id: number; teacherId: number }>(
      existingZohoAbsences.map(a => [a.occurrenceId, { id: a.id, teacherId: a.teacherId }])
    );

    let added = 0;
    let removed = 0;
    let skippedDueToOverride = 0;

    // Add missing absences (skip when overridden).
    for (const [occurrenceId, teacherId] of desired.entries()) {
      if (overrideSet.has(`${occurrenceId}-${teacherId}`)) {
        skippedDueToOverride++;
        continue;
      }
      const existing = existingByOccurrence.get(occurrenceId);
      if (existing && existing.teacherId === teacherId) continue; // already there

      // Don't trample a manual row already at this occurrence.
      const collidesWithManual = await prisma.occurrenceAbsence.findUnique({
        where: { occurrenceId },
        select: { source: true },
      });
      if (collidesWithManual && collidesWithManual.source === 'manual') continue;

      try {
        await prisma.occurrenceAbsence.upsert({
          where: { occurrenceId },
          update: { teacherId, source: 'zoho', reason: 'On approved leave per Zoho HRM' },
          create: {
            occurrenceId, teacherId, source: 'zoho',
            reason: 'On approved leave per Zoho HRM',
            createdBy: 'zoho-sync',
          },
        });
        added++;
      } catch (e) {
        console.warn(`[zoho-sync] failed to upsert absence for occ ${occurrenceId}:`, (e as any).message);
      }
    }

    // Remove zoho-derived absences that are no longer in the desired set
    // (leave was cancelled or shrunk in Zoho).
    for (const [occurrenceId, info] of existingByOccurrence.entries()) {
      if (!desired.has(occurrenceId)) {
        try {
          await prisma.occurrenceAbsence.delete({ where: { id: info.id } });
          removed++;
        } catch (e) { /* already gone */ }
      }
    }

    return { added, removed, skippedDueToOverride, teachersChecked: teachers.length, zohoOk: true };
  }

  return {
    generateOccurrences,
    regenerateForClass,
    cleanupPrivateClassOccurrences,
    removeOccurrencesInClosure,
    ensureUpcomingOccurrences,
    listClosures,
    createClosure,
    updateClosure,
    deleteClosure,
    syncZohoLeaveToAbsences,
  };
}
