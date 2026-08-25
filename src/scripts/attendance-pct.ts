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

/**
 * Compute attendance percentage for a window of rows. Returns null when the
 * filtered window is empty (no class days happened, or all of them were
 * holidays).
 */
export function pctFromRows(rows: AttendanceRowMin[]): number | null {
  if (!rows.length) return null;
  const present = rows.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
  return Math.round((present / rows.length) * 100);
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
): number | null {
  const sisTotal = rows.length;
  const sisPresent = rows.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
  const leg = legacyAttendanceCounts(legacyPct, serviceStart);
  const total = sisTotal + leg.total;
  if (total === 0) return null;
  return Math.round(((sisPresent + leg.present) / total) * 100);
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
