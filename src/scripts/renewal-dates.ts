/**
 * Renewal dating — the ISD-grounded rule for when an Academic Year RENEWAL
 * course must start, and the visa stay it creates. Internal renewals only
 * (we hold the prior ULearn visa); external first-timers are a manual,
 * knowledge-based staff step (no account/invoice at enquiry time).
 *
 * THE RULE (Neil + ISD/TrustEd, 2026-10-29):
 *   A Stamp 2 student must have STARTED the new course and submitted the renewal
 *   BEFORE the current IRP expires; the renewed permission is dated FROM the old
 *   expiry (so starting early loses no time and there is never a permission gap).
 *   Operationally: a FULL open teaching week (Mon-start → the Sunday before the
 *   prior visa end) must complete before that end — a buffer, never the same
 *   week as expiry.
 *     · prior visa ends Mon 28 Dec → normally start Mon 21 Dec (week 21–27 done
 *       before the 28th).
 *     · ENFORCED SCHOOL CLOSURES (Christmas 21 Dec–3 Jan — effectively the only
 *       one) are NOT operational weeks: a closed week does not count as the
 *       required full week, so the start is pushed back to the last fully-open
 *       week. For a 28 Dec expiry that is Mon 14 Dec (classes 14–18, full open
 *       week completing Sun 20, before the 28th).
 *   The new visa stay is dated FROM the old expiry for 35 weeks (default; later
 *   overridden by the student's uploaded IRP, like the passport auto-read).
 *
 * All math is in UTC (the dates are @db.Date = UTC midnight) to avoid the
 * Dublin-DST off-by-one — see reference_utc_date_math.
 */

import type { PrismaClient } from '../generated/prisma/client';
import { applyChristmasClosures } from './christmas-shunt';

const DAY_MS = 86_400_000;

export interface Closure { startDate: Date; endDate: Date }

/** Strip to a UTC-midnight date (drops any time-of-day / tz drift). */
function utcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}
/** The Monday (UTC) of the week containing d. */
function mondayOf(d: Date): Date {
  const x = utcDay(d);
  const daysSinceMonday = (x.getUTCDay() + 6) % 7; // Sun=0→6, Mon=1→0, … Sat=6→5
  return addDays(x, -daysSinceMonday);
}
/** True if any weekday (Mon–Fri) of the week starting `monday` is a closure day. */
function weekIsClosed(monday: Date, closures: Closure[]): boolean {
  for (let i = 0; i < 5; i++) {
    const day = addDays(monday, i);
    if (closures.some(c => day >= utcDay(c.startDate) && day <= utcDay(c.endDate))) return true;
  }
  return false;
}

export interface RenewalCourseStart {
  courseStart: Date;        // the Monday the renewal course must start on
  pushedByClosure: boolean; // true if a closed week forced it earlier
  weeksBack: number;        // how many Mondays back from the naive full-week Monday
}

/**
 * The latest Monday whose FULL open teaching week completes strictly before the
 * prior visa end, skipping any week that falls in an enforced school closure.
 */
export function computeRenewalCourseStart(priorVisaEnd: Date, closures: Closure[]): RenewalCourseStart {
  const E = utcDay(priorVisaEnd);
  // Full Mon–Sun week must end strictly before E: M + 6 < E  ⇒  M ≤ E − 7.
  const naive = mondayOf(addDays(E, -7));
  let M = naive;
  let steps = 0;
  // Step back a whole week while the candidate week has no classes (closure).
  // Guard the loop (a closure is at most ~2 weeks, so a couple of steps).
  while (weekIsClosed(M, closures) && steps < 8) { M = addDays(M, -7); steps++; }
  return {
    courseStart: M,
    pushedByClosure: steps > 0,
    weeksBack: Math.round((naive.getTime() - M.getTime()) / (7 * DAY_MS)),
  };
}

export interface RenewalVisaStay { from: Date; until: Date }

/**
 * The 35-week stay window for a renewal, course-aligned: From = the renewal
 * course start, End = +35 weeks. This matches the established SIS convention
 * (visa #1's From is the course #1 start; +35 weeks = its End). It is the STAY
 * window, not the literal IRP stamp — that is captured when the student uploads
 * the IRP (overriding these, like the passport auto-read).
 */
export function computeRenewalVisaStay(courseStart: Date): RenewalVisaStay {
  const from = utcDay(courseStart);
  return { from, until: addDays(from, 35 * 7) };
}

export interface RenewalPlan {
  courseStart: Date;        // renewal course start (= visa From)
  visaFrom: Date;           // = courseStart
  visaUntil: Date;          // = courseStart + 35 weeks
  pushedByClosure: boolean; // start pushed earlier by an enforced closure week
}

/**
 * Full renewal plan from the prior visa end: the safe course start (full open
 * teaching week before the prior end, closures skipped) and the course-aligned
 * 35-week stay window it creates.
 */
export function planRenewal(priorVisaEnd: Date, closures: Closure[]): RenewalPlan {
  const { courseStart, pushedByClosure } = computeRenewalCourseStart(priorVisaEnd, closures);
  const stay = computeRenewalVisaStay(courseStart);
  return { courseStart, visaFrom: stay.from, visaUntil: stay.until, pushedByClosure };
}

export interface ProposedStartAssessment {
  ok: boolean;
  reasons: string[]; // human-readable flags when a proposed (e.g. HubSpot) start is unsafe
}

/**
 * Flag a proposed renewal start (e.g. the date keyed in HubSpot in good faith)
 * against the computed safe start. The engine ALWAYS uses the computed date;
 * this explains WHY an incoming date differs, for the audit/flag. ok only when
 * the proposed date already equals the safe start.
 */
export function assessProposedStart(proposedStart: Date, priorVisaEnd: Date, closures: Closure[]): ProposedStartAssessment {
  const P = utcDay(proposedStart);
  const E = utcDay(priorVisaEnd);
  const safe = computeRenewalCourseStart(priorVisaEnd, closures).courseStart;
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  const reasons: string[] = [];
  if (P.getTime() !== safe.getTime()) {
    if (P >= E) {
      reasons.push(`Proposed start ${iso(P)} is on/after the prior visa end ${iso(E)} — permission-gap risk (the course must start, and the renewal be submitted, before expiry). Safe start: ${iso(safe)}.`);
    } else if (addDays(P, 6) >= E) {
      reasons.push(`Proposed start ${iso(P)} leaves no full teaching week before the prior visa end ${iso(E)}. Safe start: ${iso(safe)}.`);
    } else if (P < safe) {
      const wks = Math.round((safe.getTime() - P.getTime()) / (7 * DAY_MS));
      reasons.push(`Proposed start ${iso(P)} is ~${wks} week(s) before the safe start ${iso(safe)} — it starts inside the prior visa stay and likely ignores the 10 holiday weeks.`);
    } else {
      reasons.push(`Proposed start ${iso(P)} is not the safe start ${iso(safe)} (the last full open teaching week before the prior visa end ${iso(E)}).`);
    }
  }
  return { ok: reasons.length === 0, reasons };
}

// ── Orchestration: apply the rule to a renewal booking ──────────────────────

const AY_RE = /academic year|life ?pass|lifepass|renewal/i;
const isAyCourse = (c: { name?: string | null; holidayWks?: number | null; isRenewal?: boolean }) =>
  c.holidayWks != null || AY_RE.test(c.name || '') || !!c.isRenewal;

export interface RenewalDatingResult {
  ok: boolean;
  bookingId: number;
  skipped?: string;              // reason when not applicable (not a renewal, no base visa, …)
  committed: boolean;
  targetVisaSlot?: 1 | 2 | 3;    // which ULearn visa stay this renewal course IS (seq number)
  priorVisaEnd?: string;
  plan?: { courseStart: string; visaFrom: string; visaUntil: string; pushedByClosure: boolean };
  renewalCourse?: { id: number; name: string; fromStart: string | null; toStart: string; fromEnd: string | null; toEnd: string };
  proposedAssessment?: ProposedStartAssessment;
  changes: string[];
}

/**
 * Apply the renewal dating rule to one booking. Internal renewals only: the
 * student must already hold the prior ULearn visa stay. Idempotent — the visa
 * slot is the renewal course's position in the student's AY-course sequence
 * (course #N → visa #N), so a re-run targets the same slot.
 *
 * commit:false → returns the full plan and writes NOTHING (the code-level dry
 * run). commit:true → writes student.visa{N}From/Until + the renewal course
 * start/end, then runs the Christmas-closure shunt.
 */
export async function applyRenewalDating(
  prisma: PrismaClient,
  bookingId: number,
  opts: { commit?: boolean } = {},
): Promise<RenewalDatingResult> {
  const commit = !!opts.commit;
  const iso = (d: Date) => utcDay(d).toISOString().slice(0, 10);
  const changes: string[] = [];

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      student: {
        select: {
          id: true,
          visaUntil: true, visa2Until: true, visa3Until: true,
        },
      },
      courses: { select: { id: true, name: true, startDate: true, endDate: true, weeks: true, holidayWks: true, isRenewal: true }, orderBy: { startDate: 'asc' } },
    },
  });
  if (!booking) return { ok: false, bookingId, skipped: 'booking-not-found', committed: false, changes };
  const st = booking.student;
  if (!st) return { ok: false, bookingId, skipped: 'no-student', committed: false, changes };

  // The renewal course on this booking (latest-start isRenewal course).
  const renewalCourses = booking.courses.filter(c => c.isRenewal);
  if (!renewalCourses.length) return { ok: false, bookingId, skipped: 'not-a-renewal', committed: false, changes };
  const rc = renewalCourses[renewalCourses.length - 1];
  if (!rc.startDate) return { ok: false, bookingId, skipped: 'renewal-course-has-no-start', committed: false, changes };

  // Visa slot = this renewal course's position in the student's whole AY-course
  // sequence (course #N → visa #N). Count AY courses starting strictly earlier.
  const allAy = (await prisma.bookingCourse.findMany({
    where: { booking: { is: { studentId: st.id } } },
    select: { id: true, name: true, startDate: true, holidayWks: true, isRenewal: true },
  })).filter(isAyCourse);
  const priorCount = allAy.filter(c => c.startDate && +c.startDate < +rc.startDate!).length;
  const targetSlot = (priorCount + 1) as 1 | 2 | 3;
  if (targetSlot < 2) return { ok: false, bookingId, skipped: 'first-course (not a renewal position) — manual base visa', committed: false, changes };
  if (targetSlot > 3) return { ok: false, bookingId, skipped: 'visa-slots-exhausted (max 3)', committed: false, changes };

  // Prior visa end = the (targetSlot-1) stay's End. Missing ⇒ external first-timer
  // / unentered base visa → manual.
  const untilBySlot: Record<number, Date | null> = { 1: st.visaUntil, 2: st.visa2Until, 3: st.visa3Until };
  const priorEnd = untilBySlot[targetSlot - 1];
  if (!priorEnd) return { ok: false, bookingId, skipped: `prior visa #${targetSlot - 1} End not on file (external first-timer / manual entry)`, committed: false, changes };

  const closures = await prisma.schoolClosure.findMany({ select: { startDate: true, endDate: true } });
  const plan = planRenewal(priorEnd, closures);
  const proposedAssessment = assessProposedStart(rc.startDate, priorEnd, closures);

  const weeks = rc.weeks || 25;
  const newEnd = addDays(plan.courseStart, weeks * 7); // naive tuition end; Christmas shunt extends on commit

  const result: RenewalDatingResult = {
    ok: true, bookingId, committed: false, targetVisaSlot: targetSlot,
    priorVisaEnd: iso(priorEnd),
    plan: { courseStart: iso(plan.courseStart), visaFrom: iso(plan.visaFrom), visaUntil: iso(plan.visaUntil), pushedByClosure: plan.pushedByClosure },
    renewalCourse: { id: rc.id, name: rc.name || '', fromStart: iso(rc.startDate), toStart: iso(plan.courseStart), fromEnd: rc.endDate ? iso(rc.endDate) : null, toEnd: iso(newEnd) },
    proposedAssessment, changes,
  };

  if (!commit) {
    changes.push(`DRY-RUN — would set student.visa${targetSlot}From/Until = ${iso(plan.visaFrom)} / ${iso(plan.visaUntil)}`);
    changes.push(`DRY-RUN — would set course#${rc.id} start ${result.renewalCourse!.fromStart} → ${result.renewalCourse!.toStart}, end ${result.renewalCourse!.fromEnd} → ${result.renewalCourse!.toEnd} (+Christmas shunt)`);
    return result;
  }

  // COMMIT
  const visaData: any = {};
  visaData[`visa${targetSlot}From`] = plan.visaFrom;
  visaData[`visa${targetSlot}Until`] = plan.visaUntil;
  await prisma.student.update({ where: { id: st.id }, data: visaData });
  changes.push(`student.visa${targetSlot}From/Until = ${iso(plan.visaFrom)} / ${iso(plan.visaUntil)}`);
  // Clear shunt-managed closure holidays (type='school' is owned entirely by the
  // Christmas shunt) so moving the start doesn't leave a stale closure that
  // blocks re-extension. Set the course to the new start + NAIVE tuition end,
  // then let applyChristmasClosures re-detect any closure now inside the span,
  // re-extend the end, and re-record the school holiday.
  await prisma.bookingHoliday.deleteMany({ where: { bookingId, type: 'school' } });
  await prisma.bookingCourse.update({ where: { id: rc.id }, data: { startDate: plan.courseStart, endDate: newEnd } });
  changes.push(`course#${rc.id} start → ${iso(plan.courseStart)}, naive end → ${iso(newEnd)} (pre-shunt)`);
  try { const cs = await applyChristmasClosures(prisma, bookingId); changes.push(`christmas-shunt: applied ${cs.applied}`); }
  catch (e: any) { changes.push(`christmas-shunt failed: ${e?.message || e}`); }
  const after = await prisma.bookingCourse.findUnique({ where: { id: rc.id }, select: { endDate: true } });
  if (after?.endDate) { result.renewalCourse!.toEnd = iso(after.endDate); changes.push(`course#${rc.id} final end → ${iso(after.endDate)}`); }
  result.committed = true;
  return result;
}
