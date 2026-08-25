import { PrismaClient } from '../generated/prisma/client';

// ── Auto Christmas shunt for AY-visa bookings ──────────────────────────────
// Spec: .claude/docs/auto-christmas-shunt-spec.md
//
// When a new Academic-Year-family booking spans the school's Christmas closure,
// the closure must be accounted for automatically (Fidelo did this by splitting
// the course — the mess we cleaned up). Our cleaner equivalent: keep ONE course
// and SHUNT its end forward by the closure's weekdays, recording a
// BookingHoliday(type='school') for reporting.
//
// - Christmas ONLY: matches SchoolClosure rows named 'Christmas' (Good Friday /
//   bank holidays are school-side only and never shunt).
// - AY-visa courses ONLY: accom / extras / EU / short courses untouched.
// - Iterates: a LifePass spans 2–3 Christmases; each shunt may pull the next
//   into range. Idempotent: a closure already represented by a school holiday on
//   the booking is skipped, so re-runs are safe.
// - Deliberately bypasses addHoliday()'s manual-entry entitlement + 35-week
//   guards — an enforced closure is not part of the 10-week personal entitlement
//   (and the 35-week ceiling would wrongly block a 75-week LifePass).

// Weekday helpers — mirror scripts/bookings.ts. All math in UTC: dates are
// @db.Date (UTC midnight) and the server runs in Dublin time (UTC+1 in summer),
// so LOCAL date methods would shift a result one day early on summer dates.
function countWeekdays(start: Date, end: Date): number {
  const s = new Date(start); s.setUTCHours(0, 0, 0, 0);
  const e = new Date(end); e.setUTCHours(0, 0, 0, 0);
  if (e < s) return 0;
  let days = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const d = cur.getUTCDay();
    if (d >= 1 && d <= 5) days++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}

function addWeekdays(date: Date, weekdays: number): Date {
  const d = new Date(date); d.setUTCHours(0, 0, 0, 0);
  let added = 0;
  while (added < weekdays) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow >= 1 && dow <= 5) added++;
  }
  return d;
}

function effectiveWeekdays(holStart: Date, holEnd: Date, courseEnd: Date | null): number {
  if (!courseEnd) return 0;
  if (holStart > courseEnd) return 0;
  const cap = holEnd <= courseEnd ? holEnd : courseEnd;
  return countWeekdays(holStart, cap);
}

const AY_FAMILY = /academic year|life ?pass/i;

export async function applyChristmasClosures(prisma: PrismaClient, bookingId: number) {
  const bk = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, courses: { select: { name: true, isRenewal: true } } },
  });
  if (!bk) return { applied: 0, reason: 'booking-not-found' as const };

  const isAY = bk.courses.some(c => AY_FAMILY.test(c.name || '') || (c as any).isRenewal);
  if (!isAY) return { applied: 0, reason: 'not-ay-family' as const };

  const closures = await prisma.schoolClosure.findMany({
    where: { name: 'Christmas' },
    orderBy: { startDate: 'asc' },
    select: { startDate: true, endDate: true, note: true },
  });
  if (!closures.length) return { applied: 0, reason: 'no-christmas-defined' as const };

  const details: Array<{ window: string; weekdaysPushed: number }> = [];

  // Apply one closure per pass, re-reading course ends each time (a shunt may
  // extend the window into the next Christmas). Guard caps the loop well above
  // any real booking (a LifePass spans 3 Christmases).
  for (let pass = 0; pass < 12; pass++) {
    const courses = await prisma.bookingCourse.findMany({
      where: { bookingId },
      select: { id: true, startDate: true, endDate: true },
    });
    const existing = await prisma.bookingHoliday.findMany({
      where: { bookingId, type: 'school' },
      select: { startDate: true, endDate: true },
    });

    // Earliest Christmas that overlaps a course window and isn't already recorded.
    let target: { startDate: Date; endDate: Date; note: string | null } | null = null;
    for (const cl of closures) {
      const clS = +new Date(cl.startDate), clE = +new Date(cl.endDate);
      const already = existing.some(h => +new Date(h.startDate) <= clE && +new Date(h.endDate) >= clS);
      if (already) continue;
      const overlaps = courses.some(c =>
        c.startDate && c.endDate && +new Date(c.startDate) <= clE && +new Date(c.endDate) >= clS);
      if (!overlaps) continue;
      target = cl;
      break;
    }
    if (!target) break;

    const tS = new Date(target.startDate);
    const tE = new Date(target.endDate);
    let maxPush = 0;
    await prisma.$transaction(async (tx) => {
      const cs = await tx.bookingCourse.findMany({ where: { bookingId }, select: { id: true, endDate: true } });
      for (const c of cs) {
        const push = effectiveWeekdays(tS, tE, c.endDate);
        if (push > maxPush) maxPush = push;
        if (push > 0) {
          await tx.bookingCourse.update({ where: { id: c.id }, data: { endDate: addWeekdays(c.endDate!, push) } });
        }
      }
      if (maxPush > 0) {
        const b = await tx.booking.findUnique({ where: { id: bookingId }, select: { serviceEnd: true } });
        if (b?.serviceEnd) {
          await tx.booking.update({ where: { id: bookingId }, data: { serviceEnd: addWeekdays(b.serviceEnd, maxPush) } });
        }
      }
      await tx.bookingHoliday.create({
        data: {
          bookingId,
          startDate: tS,
          endDate: tE,
          weeks: Math.ceil(countWeekdays(tS, tE) / 5),
          type: 'school',
          weekdaysPushed: maxPush,
        } as any,
      });
    });

    details.push({ window: target.note || `${tS.toISOString().slice(0, 10)}..${tE.toISOString().slice(0, 10)}`, weekdaysPushed: maxPush });
  }

  return { applied: details.length, details };
}
