/**
 * Centralized attendance-% helper, holiday-aware.
 *
 * A class day that falls inside a student's BookingHoliday window is excluded
 * entirely — it counts as neither present nor absent. The student wasn't
 * supposed to be there, so it shouldn't drag the percentage down.
 *
 * Used by:
 *   - src/scripts/student.ts (portal /me + /challenges)
 *   - src/scripts/attendance.ts studentSummary
 *   - src/scripts/documents.ts {{student.attendance_rate}} token
 */
import type { PrismaClient } from '../generated/prisma/client';

export interface AttendanceRowMin {
  status: string;
  occurrence?: { date: Date | null } | null;
}

export interface HolidayRow {
  startDate: Date;
  endDate: Date;
}

/**
 * Filter attendance rows by removing any whose occurrence date is inside any
 * holiday window. Date comparison is done at midnight (start-of-day) so that
 * a holiday running until DD inclusive still excludes class on DD.
 */
export function filterOutHolidayDates<T extends AttendanceRowMin>(
  rows: T[],
  holidays: HolidayRow[],
): T[] {
  if (!holidays.length) return rows;
  // Pre-compute holiday windows as start-of-day ms for fast comparison
  const ranges = holidays.map(h => {
    const s = new Date(h.startDate); s.setHours(0,0,0,0);
    const e = new Date(h.endDate); e.setHours(0,0,0,0);
    return [s.getTime(), e.getTime()] as const;
  });
  return rows.filter(r => {
    if (!r.occurrence?.date) return true; // can't tell — keep
    const d = new Date(r.occurrence.date); d.setHours(0,0,0,0);
    const t = d.getTime();
    return !ranges.some(([s, e]) => t >= s && t <= e);
  });
}

// ── LATE = 50% attendance (retroactive to ALL lates) ────────────────────────
// Policy (Neil, 2026-09-16): arriving >15 min late = half a day's attendance.
// Backfilled retroactively (Neil, 2026-09-18): EVERY late now counts 0.5
// regardless of date — the original non-retrospective grandfather was dropped so
// all historical lates are corrected in one go. The calc is live (nothing is
// stored), so flipping the rule here IS the backfill — no per-row job needed.
//   Exception: LATE_GRANDFATHERED_STUDENTS keep the ORIGINAL cutoff rule (a
//   pre-activation late = full present) so a figure hand-agreed before the
//   backfill is not moved. Anchored to the occurrence DATE, not when it was keyed.
export const LATE_HALF_FROM = '2026-09-16';                        // grandfather cutoff — exception students only
export const LATE_GRANDFATHERED_STUDENTS = new Set<number>([913]); // Itgel Munkhzaya #913 (hand-set 86.40%)

function occIso(r: AttendanceRowMin): string | null {
  return r.occurrence?.date ? new Date(r.occurrence.date).toISOString().slice(0, 10) : null;
}
/**
 * Weight a single LATE row. Default: 0.5 for ALL lates (retroactive policy). A
 * grandfathered student keeps the original cutoff (0.5 only on/after the
 * activation date, else 1) so their pre-backfill figure is frozen.
 */
export function lateWeight(dateIso: string | null, studentId?: number | null): number {
  if (studentId != null && LATE_GRANDFATHERED_STUDENTS.has(studentId)) {
    return dateIso && dateIso >= LATE_HALF_FROM ? 0.5 : 1;
  }
  return 0.5;
}
/**
 * "Present-like" credit for a set of rows: PRESENT = 1, LATE per lateWeight()
 * (0.5, or grandfathered for an exception student), everything else 0. Pass the
 * studentId so the grandfather exception can apply. May be fractional.
 */
export function presentCredit(rows: AttendanceRowMin[], studentId?: number | null): number {
  let credit = 0;
  for (const r of rows) {
    if (r.status === 'PRESENT') credit += 1;
    else if (r.status === 'LATE') credit += lateWeight(occIso(r), studentId);
  }
  return credit;
}

/**
 * Compute attendance percentage for a window of rows. Returns null when the
 * filtered window is empty (no class days happened, or all of them were
 * holidays). LATE is credited per the activation-date policy above.
 */
export function pctFromRows(rows: AttendanceRowMin[], studentId?: number | null): number | null {
  if (!rows.length) return null;
  return Math.round((presentCredit(rows, studentId) / rows.length) * 100);
}

// ── Legacy (pre-migration Fidelo) attendance blend ──────────────────────────
// SIS attendance tracking began on the migration date below. For students who
// started BEFORE it, their pre-migration attendance is a single cumulative %
// imported from Fidelo (Booking.legacyAttendancePct). To show one honest
// "overall" we weight that legacy % by the number of weeks it covered
// (serviceStart → migration, × 5 class-days/week, Mon–Fri) and combine it with
// the actual SIS-tracked days since. UTC date math (server is Dublin/DST — see
// reference_utc_date_math) so the week count never drifts by a day.
const MIGRATION_UTC = Date.UTC(2026, 4, 4); // 2026-05-04

/**
 * Estimated legacy class-day counts (present/total) from a cumulative legacy %
 * and the booking start. {present:0,total:0} when there's no legacy figure or
 * the start isn't before migration.
 */
export function legacyAttendanceCounts(
  legacyPct: number | null | undefined,
  serviceStart: Date | string | null | undefined,
): { present: number; total: number } {
  if (legacyPct == null || !serviceStart) return { present: 0, total: 0 };
  const s = new Date(serviceStart);
  const startUtc = Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate());
  const weeks = Math.round((MIGRATION_UTC - startUtc) / (7 * 86400000));
  const total = weeks * 5;
  if (total <= 0) return { present: 0, total: 0 };
  return { present: Math.round((legacyPct / 100) * total), total };
}

/**
 * Overall attendance % blending already-holiday-filtered SIS rows with the
 * legacy cumulative figure. Falls back to SIS-only (== pctFromRows) when there's
 * no legacy %, and to the legacy figure alone when there are no SIS rows yet.
 * null when there's nothing to compute.
 */
export function blendedAttendancePct(
  rows: AttendanceRowMin[],
  legacyPct: number | null | undefined,
  serviceStart: Date | string | null | undefined,
  studentId?: number | null,
): number | null {
  const sisTotal = rows.length;
  const sisPresent = presentCredit(rows, studentId);
  const leg = legacyAttendanceCounts(legacyPct, serviceStart);
  const total = sisTotal + leg.total;
  if (total === 0) return null;
  return Math.round(((sisPresent + leg.present) / total) * 100);
}

// ── Per-course tuition-capped rate (Academic Year / LifePass) ───────────────
// Server mirror of admin.html `_courseAtt`. An AY course's LoA/compliance window
// is 35 concrete weeks but only 25 are TUITION — the other `holidayWks` (10) are
// a floating personal-holiday allowance. Dated holidays inside the window are
// excluded; the denominator is then the FIRST (35 − holidayWks) weeks of
// non-holiday class days (the tuition weeks), so the tail allowance never drags
// the %. Capping (not a date cut) keeps it correct mid-course and on shorter
// spans. `holidayWks` null/0 ⇒ no cap (non-AY course = plain windowed rate).
const AY_STAY_WEEKS_PCT = 35;
export function courseTuitionRate(
  rows: AttendanceRowMin[],
  startIso: string | null,
  endIso: string | null,
  holidayWks: number | null | undefined,
  isHoliday: (date: Date | null) => boolean,
  studentId?: number | null,
): { rate: number | null; present: number; total: number; usedWks: number; remainingWks: number; entitlement: number } {
  const isoOf = (r: AttendanceRowMin) => r.occurrence?.date ? new Date(r.occurrence.date).toISOString().slice(0, 10) : null;
  const inWin = rows.filter(r => { const dt = isoOf(r); return !!dt && (!startIso || dt >= startIso) && (!endIso || dt <= endIso); });
  const usedWks = Math.round((inWin.filter(r => isHoliday(r.occurrence?.date || null)).length / 5) * 10) / 10;
  const hw = (holidayWks == null) ? 0 : Number(holidayWks);
  const remainingWks = Math.max(0, hw - usedWks);
  const nonHol = inWin.filter(r => !isHoliday(r.occurrence?.date || null)).sort((a, b) => (isoOf(a) || '').localeCompare(isoOf(b) || ''));
  const tuitionDays = hw > 0 ? Math.max(0, AY_STAY_WEEKS_PCT - hw) * 5 : Infinity;
  const counted = nonHol.slice(0, tuitionDays);
  const present = presentCredit(counted, studentId);
  return { rate: counted.length ? Math.round((present / counted.length) * 100) : null, present, total: counted.length, usedWks, remainingWks, entitlement: hw };
}

/**
 * Convenience: fetch a student's holidays from the DB. Returns the start/end
 * Date objects directly (no other fields needed for filtering).
 */
export async function fetchStudentHolidays(
  prisma: PrismaClient,
  studentId: number,
): Promise<HolidayRow[]> {
  const rows = await prisma.bookingHoliday.findMany({
    where: { booking: { studentId } },
    select: { startDate: true, endDate: true },
  });
  return rows;
}
