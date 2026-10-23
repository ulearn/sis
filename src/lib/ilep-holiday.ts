// Holiday-timing rules for Academic Year students, measured in NOMINAL weeks
// from the course start. Rewritten 2026-10-22 per
// `.claude/tmp/SIS_Holiday_Rules_Claude_Code_Handover.md` (ref
// `ULearn_Holiday_Policy_Canonical_KB.md`).
//
// Two rules apply to a proposed in-course holiday, on top of the hard 10-week
// per-course entitlement enforced by the caller:
//
//   A. SIX-WEEK IN-COURSE CAP (operational). At most 6 holiday weeks may be
//      taken DURING the course; the remaining 4 of the 10-week entitlement are
//      held back for after tuition ends. We count EVERY in-course holiday week
//      (previously approved + proposed), not a calendar-position bucket — the
//      old tuition(3–25)/tail(26–35) split let a 7th in-course week slip through
//      once earlier holidays had shunted the course end past calendar week 25
//      (student #1046, Oct 2026).
//
//   B. CUMULATIVE ONE-THIRD TIMING (ISD TrustEd, Feb 2026). At no week boundary
//      may cumulative holiday weeks exceed one-third of elapsed programme weeks
//      — i.e. no front-loading. Validated across the whole proposed interval,
//      not just its final day.
//
// COMPLIANCE CAVEAT (handover §Compliance): the 2025 ILEP criteria (≤30 weeks
// enrolment while delivering 25 tuition weeks) sit awkwardly with six full weeks
// of in-course breaks. The six-week cap is an explicit PROVISIONAL management
// decision, NOT a statement of regulatory compliance. The 6th in-course week is
// therefore flagged (`complianceFlag`) for administrative review — the caller
// must never present it as ISD/regulator-approved. `HOLIDAY_IN_COURSE_CAP` keeps
// a configurable path to a five-week cap once the discrepancy is resolved.

export const RULE_VERSION = '2026-10-22';

// Operational in-course cap. Override via env to drop to 5 once ULearn resolves
// the ILEP 30-week/25-tuition discrepancy — no code change needed.
export const HOLIDAY_IN_COURSE_CAP = (() => {
  const n = Number(process.env.HOLIDAY_IN_COURSE_CAP);
  return Number.isInteger(n) && n > 0 ? n : 6;
})();

// Cumulative holiday must stay within 1/Nth of elapsed programme weeks.
export const HOLIDAY_TIMING_DIVISOR = 3;

// Legacy ILEP split — retained for reference/reporting only; NOT used by the
// live check any more (see rule A above for why the buckets were unsafe).
export const ILEP_TUITION_CAP = 6;   // weeks 3–25
export const ILEP_TAIL_CAP = 4;      // weeks 26–35

// 1-based nominal week number of a date relative to the course start (the
// course-start week is week 1). Courses + holidays start on a Monday, so the
// offset is a whole number of weeks.
function weekNumber(courseStart: Date, d: Date): number {
  const diffDays = Math.round((+d - +courseStart) / 86400000);
  return Math.floor(diffDays / 7) + 1;
}

// Split a holiday (start Monday + N whole weeks) into the legacy ILEP buckets by
// the week number of each of its weeks. Kept for reporting; the live allowance
// check no longer buckets on it.
export function classifyIlepHoliday(courseStart: Date, holStart: Date, weeks: number): {
  startWeek: number; firstTwo: number; tuition: number; tail: number; beyond: number;
} {
  const startWeek = weekNumber(courseStart, holStart);
  let firstTwo = 0, tuition = 0, tail = 0, beyond = 0;
  for (let i = 0; i < Math.max(0, weeks); i++) {
    const wk = startWeek + i;
    if (wk <= 2) firstTwo++;
    else if (wk <= 25) tuition++;
    else if (wk <= 35) tail++;
    else beyond++;
  }
  return { startWeek, firstTwo, tuition, tail, beyond };
}

export type HolidayAllowanceResult =
  | { ok: true; inCourseWeeks: number; elapsedWeeks: number; complianceFlag: boolean; complianceReason?: string; ruleVersion: string }
  | { ok: false; error: string; rule: 'first-two-weeks' | 'in-course-cap' | 'one-third-timing'; ruleVersion: string };

// Validate a proposed in-course holiday against rules A + B, given the holidays
// already recorded in the SAME course window (the caller passes an in-course set
// — rows overlapping [courseStart, courseEnd]; genuinely post-course leave is
// excluded by that filter and does not count here).
//
// `existing` weeks are treated as already-approved in-course weeks; the proposed
// holiday is assumed in-course (the caller resolves the covering course first).
export function checkIlepAllowance(
  courseStart: Date,
  existing: { startDate: Date | string; weeks: number | null }[],
  newStart: Date,
  newWeeks: number,
): HolidayAllowanceResult {
  const weeks = Math.max(0, newWeeks | 0);
  const newStartWeek = weekNumber(courseStart, newStart);

  // ── no holidays in the first 2 weeks (ILEP) ──────────────────────────────
  if (newStartWeek <= 2) {
    return { ok: false, error: 'Holidays aren’t permitted in the first 2 weeks of the course (ILEP rule).', rule: 'first-two-weeks', ruleVersion: RULE_VERSION };
  }

  // ── A. six-week in-course cap ─────────────────────────────────────────────
  const existingWeeks = existing.reduce((s, h) => s + (h.weeks || 0), 0);
  const inCourseWeeks = existingWeeks + weeks;
  if (inCourseWeeks > HOLIDAY_IN_COURSE_CAP) {
    return {
      ok: false,
      rule: 'in-course-cap',
      ruleVersion: RULE_VERSION,
      error: existingWeeks >= HOLIDAY_IN_COURSE_CAP
        ? `You've already used your ${HOLIDAY_IN_COURSE_CAP} holiday weeks for during the course. The remaining weeks of your allowance are kept for after your course ends.`
        : `That would bring your in-course holidays to ${inCourseWeeks} weeks, but at most ${HOLIDAY_IN_COURSE_CAP} may be taken during the course (you've used ${existingWeeks}). The rest are kept for after your course ends.`,
    };
  }

  // ── B. cumulative one-third timing (no front-loading) ─────────────────────
  // At each week boundary the proposed holiday touches, cumulative holiday weeks
  // up to that boundary must be ≤ elapsed programme weeks / 3. Build a per-week
  // occupancy map of the existing + proposed holiday weeks, then test every
  // boundary the proposal introduces.
  const holidayWeekNo = new Set<number>();
  for (const h of existing) {
    const sWk = weekNumber(courseStart, new Date(h.startDate));
    for (let i = 0; i < (h.weeks || 0); i++) holidayWeekNo.add(sWk + i);
  }
  for (let i = 0; i < weeks; i++) holidayWeekNo.add(newStartWeek + i);
  const cumUpTo = (boundary: number) => [...holidayWeekNo].filter((w) => w <= boundary).length;
  for (let i = 0; i < weeks; i++) {
    const boundary = newStartWeek + i;        // this holiday week's position = elapsed programme weeks at that point
    const cum = cumUpTo(boundary);
    if (HOLIDAY_TIMING_DIVISOR * cum > boundary) {
      const cap = Math.floor(boundary / HOLIDAY_TIMING_DIVISOR);
      return {
        ok: false,
        rule: 'one-third-timing',
        ruleVersion: RULE_VERSION,
        error: `Too much holiday too early — by week ${boundary} of your course you'd have ${cum} holiday weeks, but holidays can't exceed one-third of the course elapsed so far (${cap} week${cap === 1 ? '' : 's'} by then). Please spread them out or choose a later date.`,
      };
    }
  }

  // ── compliance flag on the capped (6th) in-course week ────────────────────
  const complianceFlag = inCourseWeeks >= HOLIDAY_IN_COURSE_CAP;
  return {
    ok: true,
    inCourseWeeks,
    elapsedWeeks: newStartWeek + Math.max(0, weeks - 1),
    complianceFlag,
    complianceReason: complianceFlag
      ? `Brings in-course holidays to ${inCourseWeeks}/${HOLIDAY_IN_COURSE_CAP} weeks — at the operational cap. The cap is a provisional management decision, NOT an ISD/regulatory approval (ILEP 30-wk/25-tuition tension). Review before treating as compliant.`
      : undefined,
    ruleVersion: RULE_VERSION,
  };
}
