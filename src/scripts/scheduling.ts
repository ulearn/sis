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
   */
  async function generateOccurrences(from: Date, to: Date) {
    const fromD = new Date(from); fromD.setHours(0, 0, 0, 0);
    const toD = new Date(to); toD.setHours(0, 0, 0, 0);

    const classes = await prisma.class.findMany({ where: { active: true } });
    const closures = await prisma.schoolClosure.findMany();

    const inClosure = (date: Date) => closures.some(c =>
      date >= new Date(c.startDate) && date <= new Date(c.endDate)
    );

    let created = 0;
    let skippedClosure = 0;
    let skippedExisting = 0;

    for (const cls of classes) {
      const dayCodes: number[] = (cls.days as any as number[]) || [];
      if (dayCodes.length === 0) continue;

      for (let d = new Date(fromD); d <= toD; d.setDate(d.getDate() + 1)) {
        // getDay: 0=Sun, 1=Mon ... 6=Sat — matches our [1..5] convention
        if (!dayCodes.includes(d.getDay())) continue;
        if (inClosure(d)) { skippedClosure++; continue; }

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

    return { created, skippedClosure, skippedExisting, classesProcessed: classes.length };
  }

  /** Regenerate occurrences for a single class from today forward (8 weeks). */
  async function regenerateForClass(classId: number) {
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls || !cls.active) return { created: 0 };

    const from = new Date(); from.setHours(0, 0, 0, 0);
    const to = new Date(from); to.setDate(to.getDate() + 7 * 8);

    const closures = await prisma.schoolClosure.findMany();
    const inClosure = (date: Date) => closures.some(c =>
      date >= new Date(c.startDate) && date <= new Date(c.endDate)
    );

    const dayCodes: number[] = (cls.days as any as number[]) || [];
    if (dayCodes.length === 0) return { created: 0 };

    let created = 0;
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (!dayCodes.includes(d.getDay())) continue;
      if (inClosure(d)) continue;
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

  /** Delete future occurrences that fall inside a closure window. */
  async function removeOccurrencesInClosure(closureId: number) {
    const closure = await prisma.schoolClosure.findUnique({ where: { id: closureId } });
    if (!closure) return { deleted: 0 };

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

  return {
    generateOccurrences,
    regenerateForClass,
    removeOccurrencesInClosure,
    ensureUpcomingOccurrences,
    listClosures,
    createClosure,
    updateClosure,
    deleteClosure,
  };
}
