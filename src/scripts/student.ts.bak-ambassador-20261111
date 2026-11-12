/**
 * Student portal business logic.
 *
 * Resolves the logged-in student from `session.studentId` (set at login by
 * /sis/auth/login when userType==='student' — see app.ts). Returns shaped
 * payloads for the three tabs: Profile (SIS), Challenges, LMS.
 */
import type { PrismaClient } from '../generated/prisma/client';
import { Prisma } from '../generated/prisma/client';
import { studentSearchSql } from '../lib/student-search';
import { computeImpact } from '../lib/impact-score';

// KickStart prize: each Progress Post has a 14-day measurement window from the
// moment it's linked. After that it exits the window (algos sink with age).
const POST_WINDOW_DAYS = 14;
import { fetchStudentHolidays, filterOutHolidayDates, pctFromRows, blendedAttendancePct, courseTuitionRate, legacyAttendanceCounts, presentCredit } from './attendance-pct';
import { kellyMention } from '../lib/slack';
import { notifyChallenge } from '../lib/challenge-notify';
import { mapCourseType, buildBaseDealProps } from './booking-deal';
import { sendStudentEmail } from '../routes/email';
import { bookingScripts } from './bookings';
import { checkIlepAllowance, HOLIDAY_IN_COURSE_CAP } from '../lib/ilep-holiday';

const iso = (d: any) => d ? new Date(d).toISOString().slice(0, 10) : null;

// EU/EEA/Swiss nationalities can't take work-study holidays (no visa window).
const EU_EEA_CH = new Set(['austria','belgium','bulgaria','croatia','cyprus','czechia','czech republic','denmark','estonia','finland','france','germany','greece','hungary','ireland','italy','latvia','lithuania','luxembourg','malta','netherlands','poland','portugal','romania','slovakia','slovenia','spain','sweden','iceland','liechtenstein','norway','switzerland']);

// Minutes/ms Europe/Dublin is ahead of UTC at a given instant (+1h in IST
// summer, 0 in GMT winter) — derived from the zone itself so it's DST-correct
// without a hardcoded changeover date (see reference_utc_date_math).
function dublinOffsetMs(utcMs: number): number {
  const dtf = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Dublin', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const p: any = {}; for (const part of dtf.formatToParts(new Date(utcMs))) p[part.type] = part.value;
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +(p.hour === '24' ? '0' : p.hour), +p.minute, +p.second);
  return asUtc - utcMs;
}
// Class start by session — AY students are either morning or afternoon (Neil):
// morning lesson 9:00am, afternoon lesson 1:45pm. The holiday cut-off is 30 min
// before the student's own class, so the picker/floor is session-specific.
// Resolved off the AY course (category first, else its name).
function holidayCutoffForCourse(course: { category?: string | null; name?: string | null } | null | undefined): { h: number; m: number } {
  const s = `${course?.category || ''} ${course?.name || ''}`;
  if (/afternoon|evening/i.test(s)) return { h: 13, m: 15 };   // 1:45pm class − 30 min
  return { h: 8, m: 30 };                                      // 9:00am class − 30 min (morning / default)
}
// The true UTC instant of the given Dublin wall-clock time (h:m) on the given
// (UTC-midnight) Monday — the self-service holiday cut-off for that session.
function holidayMondayCutoffMs(mondayMidnightUtc: Date, h: number, m: number): number {
  const guess = Date.UTC(mondayMidnightUtc.getUTCFullYear(), mondayMidnightUtc.getUTCMonth(), mondayMidnightUtc.getUTCDate(), h, m, 0);
  return guess - dublinOffsetMs(guess);
}
// Earliest Monday a student may start a holiday. The notice rule is now simply:
// you can set a holiday for a Monday right up until 30 min before your class
// (08:30 Dublin for morning, 13:15 for afternoon) that same Monday. So the
// earliest eligible Monday is the current or coming Monday whose cut-off is
// still in the future — once it passes, it rolls to the next Monday. (Was: by
// 17:00 the Friday before; relaxed per Neil 2026-10-13 — staff set these
// manually anyway, so the hard floor just needs to stop a student booking a
// holiday after their class has begun.) Returns a UTC-midnight Monday; the app
// re-uses it as the picker's minimum.
function earliestHolidayStartMonday(now: Date = new Date(), cutoff: { h: number; m: number } = { h: 8, m: 30 }): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dow = d.getUTCDay();                                   // 0=Sun..1=Mon..6=Sat
  const add = (8 - dow) % 7;                                   // current/coming Monday (0 if today is Monday)
  const monday = new Date(d); monday.setUTCDate(d.getUTCDate() + add);
  while (holidayMondayCutoffMs(monday, cutoff.h, cutoff.m) <= now.getTime()) monday.setUTCDate(monday.getUTCDate() + 7);
  return monday;
}

export function studentScripts(prisma: PrismaClient) {

  // ── HubSpot (student self-service booking) ──────────────────────────
  // A logged-in student booking a new course/extension creates a HubSpot Deal
  // against their EXISTING contact (never a second contact). See book() below.
  const HUBSPOT_PAT = process.env.HUBSPOT_WRITE_TOKEN || process.env.ACCESS_TOKEN;
  const HS = 'https://api.hubapi.com';
  const B2B_PIPELINE = '35765201';            // Partner students → B2B Sales pipeline
  const ENROLMENT_STAGE = '109570243';        //   …ENROLMENT stage
  const DIRECT_PIPELINE = 'default';          // Direct (no agency) → Direct Sales pipeline
  const DIRECT_CONTRACT_STAGE = 'contractsent'; //   …CONTRACT stage
  async function hsRequest(method: string, path: string, body?: any): Promise<any> {
    const opts: any = {
      method,
      headers: { 'Authorization': `Bearer ${HUBSPOT_PAT}`, 'Content-Type': 'application/json' },
    };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);
    const res = await fetch(HS + path, opts);
    return res.json().catch(() => ({}));
  }

  // Shared accommodation shape (address/map resolution). Used by the in-view
  // booking in me() and by the on-demand Upcoming / History lists so all three
  // render identically.
  function buildAccom(accom: any) {
    if (!accom) return null;
    const property = accom?.bed?.room?.property || null;
    const provider = property?.provider || null;
    // property.address wins (apartments/residences have a physical address
    // distinct from the management company); Host Families only set provider.address.
    const addrLine1 = property?.address || provider?.address || null;
    const addrLine2 = provider?.addressAddon || null;
    const fullAddress = [addrLine1, addrLine2, provider?.zip, provider?.city].filter(Boolean).join(', ') || null;
    const mapUrl = fullAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}` : null;
    return {
      type: accom.accommodationType,
      roomType: accom.roomType,
      board: accom.board,
      startDate: accom.startDate,
      endDate: accom.endDate,
      address: fullAddress,
      mapUrl,
      provider: provider ? { name: provider.name, city: provider.city, phone: provider.mobile || provider.phone } : null,
    };
  }

  // Effective service window of a booking. Prefers the denormalised
  // serviceStart/serviceEnd; falls back to the span of its courses +
  // accommodations when those aren't set (e.g. a hand-created booking), so date
  // bucketing still works. Nulls only when the booking has no dated part at all.
  function windowOf(b: any): { start: Date | null; end: Date | null } {
    // Fallback span from the booking's parts — used ONLY per-edge when the
    // denormalised serviceStart/serviceEnd is missing (don't blend the two, or a
    // late course end would override a real serviceEnd).
    const starts: number[] = [], ends: number[] = [];
    const push = (d: any, arr: number[]) => { if (d) { const t = new Date(d).getTime(); if (!isNaN(t)) arr.push(t); } };
    for (const c of b.courses || []) { push(c.startDate, starts); push(c.endDate, ends); }
    for (const a of b.accommodations || []) { push(a.startDate, starts); push(a.endDate, ends); }
    const start = b.serviceStart ? new Date(b.serviceStart) : (starts.length ? new Date(Math.min(...starts)) : null);
    const end   = b.serviceEnd   ? new Date(b.serviceEnd)   : (ends.length   ? new Date(Math.max(...ends))   : null);
    return { start, end };
  }

  // Full serialisation of one booking (course + accommodation + invoice) for the
  // Upcoming / History overlays.
  function serializeBooking(b: any, phase: 'upcoming' | 'past') {
    const c = b.courses?.[0] || null;
    return {
      id: b.id,
      phase,
      serviceStart: b.serviceStart,
      serviceEnd: b.serviceEnd,
      status: b.status,
      invoiceUrl: b.hubspotInvoiceUrl || null,
      course: c ? { name: c.name, level: c.level, startDate: c.startDate, endDate: c.endDate, weeks: c.weeks, hoursPerWeek: c.hoursPerWeek } : null,
      accommodation: buildAccom(b.accommodations?.[0] || null),
    };
  }

  // The student's OTHER bookings (everything except the one in view), bucketed
  // into upcoming (starts in the future, soonest first) and past (already ended,
  // most recent first). Loaded on demand by the Course-section links so the /me
  // payload stays lean. `excludeId` = the booking already in full view.
  async function bookingsList(studentId: number, excludeId?: number) {
    const now = new Date();
    const bookings = await prisma.booking.findMany({
      where: { studentId },
      orderBy: { id: 'desc' },
      include: {
        courses: { orderBy: { startDate: 'desc' } },
        accommodations: { orderBy: { startDate: 'desc' }, include: { bed: { include: { room: { include: { property: { include: { provider: true } } } } } } } },
      },
    });
    const usable = bookings.filter(b => b.id !== excludeId && b.status !== 'CANCELLED');
    const win = new Map(usable.map(b => [b.id, windowOf(b)] as const));
    const upcoming = usable
      .filter(b => { const w = win.get(b.id)!; return w.start && w.start > now; })
      .sort((a, b) => win.get(a.id)!.start!.getTime() - win.get(b.id)!.start!.getTime())
      .map(b => serializeBooking(b, 'upcoming'));
    const past = usable
      .filter(b => { const w = win.get(b.id)!; return w.end && w.end < now; })
      .sort((a, b) => win.get(b.id)!.end!.getTime() - win.get(a.id)!.end!.getTime())
      .map(b => serializeBooking(b, 'past'));
    return { upcoming, past };
  }

  async function me(studentId?: number) {
    if (!studentId) return { student: null, error: 'No student session' };

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        nationality: true, birthday: true, phoneMobile: true, phone: true,
        currentLevel: true, profilePicture: true, language: true, beta: true,
        passportValidUntil: true,
        // Address pair surfaced + editable in the Personal section (student.html):
        // native/home address and the Irish (in-country) address. The Irish address
        // is required for ISD/address-bearing documents (Confirmation with Address),
        // so the self-service document picker gates on it being filled.
        address: true, addressAddon: true, zip: true, city: true, state: true, countryIso: true,
        irishAddress: true, irishAddressAddon: true, irishZip: true, irishCity: true, irishState: true, irishCountryIso: true,
        // Surfaced in the Overview "Personal" section (student.html) — same
        // column the Challenges Social card edits. Without it the row shows "—"
        // even when a handle is set.
        instagramHandle: true,
        // Null → app shows the welcome video once (after the agreement gate).
        welcomeVideoSeenAt: true,
      },
    });
    if (!student) return { student: null, error: 'Student not found' };

    // In-view booking, chosen by DATE (not row id): the booking live right now
    // (serviceStart ≤ today ≤ serviceEnd); else the nearest UPCOMING one (shown
    // in full, badged "Upcoming" until it starts); else the most recent past one.
    // The rest are reachable via the Upcoming →/History → links (bookingsList,
    // loaded on demand). When today's course ends the next one slides into view
    // automatically on the next load.
    const now = new Date();
    const today = now;   // alias — later "this week" + passport-window math use `today`
    const bookings = await prisma.booking.findMany({
      where: { studentId },
      orderBy: { id: 'desc' },
      include: {
        courses: { orderBy: { startDate: 'desc' } },
        accommodations: {
          orderBy: { startDate: 'desc' },
          include: {
            bed: { include: { room: { include: { property: { include: { provider: true } } } } } },
          },
        },
      },
    });
    // Bucket by EFFECTIVE service window (windowOf) and drop CANCELLED. A booking
    // whose serviceStart/serviceEnd weren't populated still sorts by its course/
    // accommodation dates, so a hand-created future booking still surfaces.
    const usable = bookings.filter(b => b.status !== 'CANCELLED');
    const win = new Map(usable.map(b => [b.id, windowOf(b)] as const));
    const active = usable.find(b => { const w = win.get(b.id)!; return w.start && w.end && w.start <= now && w.end >= now; }) || null;
    const futureSorted = usable
      .filter(b => { const w = win.get(b.id)!; return w.start && w.start > now; })
      .sort((a, b) => win.get(a.id)!.start!.getTime() - win.get(b.id)!.start!.getTime());
    const pastSorted = usable
      .filter(b => { const w = win.get(b.id)!; return w.end && w.end < now; })
      .sort((a, b) => win.get(b.id)!.end!.getTime() - win.get(a.id)!.end!.getTime());
    const current = active || futureSorted[0] || pastSorted[0] || usable[0] || null;
    const isUpcoming = !!current && !active && current === futureSorted[0];
    // Counts of the OTHER bookings (excluding the one in view) → drive the links.
    const upcomingCount = futureSorted.filter(b => b.id !== current?.id).length;
    const pastCount = pastSorted.filter(b => b.id !== current?.id).length;

    // The course to headline is the one running TODAY — not courses[0], which is
    // the latest by the query's desc order (a LifePass booking nests 3, so [0]
    // was showing year-3 dates). Pick: the course containing today → else the
    // most-recent one already started (mid-gap between nested courses) → else the
    // earliest upcoming → else null. Mirrors the attendance compliance course.
    const _nowMs = now.getTime();
    const _cc = (current?.courses || []).filter((c: any) => c.startDate);
    const course =
      _cc.find((c: any) => +new Date(c.startDate) <= _nowMs && c.endDate && _nowMs <= +new Date(c.endDate) + 86400000)
      || [..._cc].sort((a: any, b: any) => +new Date(b.startDate) - +new Date(a.startDate)).find((c: any) => +new Date(c.startDate) <= _nowMs)
      || [..._cc].sort((a: any, b: any) => +new Date(a.startDate) - +new Date(b.startDate))[0]
      || current?.courses?.[0] || null;
    const accom = current?.accommodations?.[0] || null;
    const accommodationObj = buildAccom(accom);

    // Attendance — count records for this student. Holiday days are excluded
    // entirely from the calculation (neither present nor absent — the student
    // wasn't supposed to be in class).
    const attRowsAll = await prisma.attendance.findMany({
      where: { studentId },
      select: { status: true, hours: true, occurrence: { select: { date: true } } },
    });
    const holidays = await fetchStudentHolidays(prisma, studentId);
    const attRows = filterOutHolidayDates(attRowsAll, holidays);
    const total = attRows.length;
    // Overall attendance headline. For Academic-Year / LifePass bookings we show
    // the SAME per-course, tuition-capped figure the school tracks in admin (so
    // staff and student never disagree): scoped to the compliance course — the AY
    // course running today, else the most-recent started, else the earliest — and
    // capped at its 25 tuition weeks. Legacy pre-migration figures are NOT blended
    // in (per-course = SIS-only, by design). Everyone else keeps the lifetime
    // blended figure (folds in the pre-migration Fidelo % weighted with SIS days).
    const ayCourses = (current?.courses || [])
      .filter((c: any) => c.holidayWks != null && c.startDate)
      .sort((a: any, b: any) => +new Date(a.startDate) - +new Date(b.startDate));
    const iso = (d: any) => d ? new Date(d).toISOString().slice(0, 10) : null;
    let overallPct: number | null;
    // Academic-Year compliance block — the hard 85% picture the app now shows
    // beside the absences (max absences, used so far, holiday allowance left).
    // Null for non-AY bookings (those keep the plain overall %).
    let academicYear: any = null;
    if (ayCourses.length) {
      const ranges = holidays.map(h => { const s = new Date(h.startDate); s.setHours(0,0,0,0); const e = new Date(h.endDate); e.setHours(0,0,0,0); return [s.getTime(), e.getTime()] as const; });
      const isHoliday = (d: Date | null) => { if (!d) return false; const x = new Date(d); x.setHours(0,0,0,0); const t = x.getTime(); return ranges.some(([s, e]) => t >= s && t <= e); };
      const nowMs = Date.now();
      const compliance =
        ayCourses.find((c: any) => +new Date(c.startDate) <= nowMs && c.endDate && nowMs <= +new Date(c.endDate) + 86400000)
        || [...ayCourses].reverse().find((c: any) => +new Date(c.startDate) <= nowMs)
        || ayCourses[ayCourses.length - 1];
      const cr = courseTuitionRate(attRowsAll, iso(compliance.startDate), iso(compliance.endDate), compliance.holidayWks, isHoliday, studentId);
      // Headline = the OFFICIAL blended figure everyone now sees (Neil, 2026-09-16)
      // — the same number as the admin "Life" column and the LoA: SIS-tracked days
      // blended with the pre-migration Fidelo figure when the booking carries one
      // (no legacy → just the SIS lifetime figure). Removes the app-vs-official gap
      // that started the whole attendance dispute. LATE is credited per policy.
      const legPct = current?.legacyAttendancePct != null ? Number(current.legacyAttendancePct) : null;
      const leg = legPct != null ? legacyAttendanceCounts(legPct, current?.serviceStart || null) : { present: 0, total: 0 };
      const daysPresent = presentCredit(attRows, studentId) + leg.present;
      const daysCounted = attRows.length + leg.total;
      overallPct = daysCounted ? Math.round((daysPresent / daysCounted) * 100) : cr.rate;

      // Hard absence limit: over the 25 tuition weeks (125 days) an 85% floor
      // permits at most floor(125 × 15%) = 18 days absent. Show absences-so-far
      // against that ceiling — a limit, never a target.
      const entitlement = Number(compliance.holidayWks ?? 10);
      const tuitionDays = Math.max(0, 35 - entitlement) * 5;
      const maxAbsences = Math.floor(tuitionDays * 0.15);
      const absencesUsed = Math.max(0, Math.round((daysCounted - daysPresent) * 10) / 10);
      // Holiday weeks already taken within THIS course window (from the holiday
      // records — the source of truth, robust to future-dated holidays).
      const hRows = current ? await prisma.bookingHoliday.findMany({ where: { bookingId: current.id }, select: { startDate: true, endDate: true, weeks: true } }) : [];
      const cs = compliance.startDate ? +new Date(compliance.startDate) : -Infinity, ce = compliance.endDate ? +new Date(compliance.endDate) : Infinity;
      const holidayWeeksTaken = hRows.filter(h => +new Date(h.startDate) <= ce && +new Date(h.endDate) >= cs).reduce((s, h) => s + (h.weeks || 0), 0);
      // Straddles migration: the course started before SIS attendance tracking
      // began (2026-05-04), so its pre-migration days exist only as a cumulative
      // Fidelo % — never as daily records. The blended OVERALL % is accurate, but
      // the absolute counts (attended X of Y, "X of 18 days absent") can't be made
      // exact for the pre-migration slice, so the app hides them for these and
      // shows the % only (Neil, 2026-09-21).
      const preMigration = !!(compliance.startDate && iso(compliance.startDate)! < '2026-05-04');
      academicYear = {
        courseName: compliance.name,
        courseStart: iso(compliance.startDate),
        courseEnd: iso(compliance.endDate),
        preMigration,
        maxAbsences,
        absencesUsed,
        daysPresent: Math.round(daysPresent * 10) / 10,   // attended, blended (SIS + legacy)
        daysCounted,                                        // blended total (SIS + legacy est.)
        tuitionDays,
        holidayAllowanceWeeks: entitlement,
        holidayWeeksTaken,
        holidayRemainingWeeks: Math.max(0, entitlement - holidayWeeksTaken),
        earliestHolidayStart: iso(earliestHolidayStartMonday(new Date(), holidayCutoffForCourse(compliance as any))),
      };
    } else {
      overallPct = blendedAttendancePct(
        attRows,
        current?.legacyAttendancePct != null ? Number(current.legacyAttendancePct) : null,
        current?.serviceStart || null,
        studentId,
      );
    }

    // "This week" = Monday-of-this-week to today
    const monday = new Date(today);
    const dow = (monday.getDay() + 6) % 7; // 0 = Mon
    monday.setDate(monday.getDate() - dow);
    monday.setHours(0, 0, 0, 0);
    const wkRows = attRows.filter(r => r.occurrence?.date && r.occurrence.date >= monday);
    const weekPct = pctFromRows(wkRows, studentId);

    // Class timetable footnote — pulled from the student's current
    // StudentClassAssignment so we can show "Mon-Fri · 09:00-12:20 · Room 1
    // @ Harcourt Centre" inside Course Details. Uses the most recent open
    // assignment as the source of truth.
    const todayD = new Date(); todayD.setHours(0, 0, 0, 0);
    const assignment: any = await prisma.studentClassAssignment.findFirst({
      where: {
        studentId,
        weekStart: { lte: todayD },
        OR: [{ weekEnd: null }, { weekEnd: { gte: todayD } }],
      },
      orderBy: { weekStart: 'desc' },
      include: {
        class_: {
          select: {
            name: true, level: true, session: true,
            startTime: true, endTime: true, days: true,
            classroom: { select: { name: true } } as any,
          } as any,
        },
      } as any,
    });
    const cls = assignment?.class_ || null;
    const timetable = cls ? {
      days: (cls.days as number[]) || [],
      startTime: cls.startTime,
      endTime: cls.endTime,
      classroomName: cls.classroom?.name || null,
      // The class's CEFR — what the student is *actually* attending. The
      // mobile Profile prefers this over BookingCourse.level (which is the
      // level on the original sale and stays static if the student is moved
      // between classes — e.g. from a B2 placement to an A2 group).
      level: cls.level || null,
      session: cls.session || null,
      className: cls.name || null,
    } : null;

    // Documents — issued only (drafts aren't shown to students)
    const documents = await prisma.documentRecord.findMany({
      where: { studentId, status: 'ISSUED' },
      orderBy: { issuedAt: 'desc' },
      select: {
        id: true, documentType: true, issuedAt: true, versionNo: true,
        template: { select: { name: true, slug: true } },
      },
      take: 10,
    });

    // Passport-expiry check against the travel window (earliest upcoming course
    // start → latest end across live/upcoming bookings). Critical if it expires
    // before the course starts (can't travel); warning if before it ends (renew
    // at home — overseas renewals take months). Null when the passport covers
    // the whole trip or dates are missing.
    const nowMs = today.getTime();
    const upcoming = bookings.filter(b => b.serviceEnd && b.serviceEnd.getTime() >= nowMs);
    const startsMs = upcoming.map(b => b.serviceStart?.getTime()).filter((t): t is number => !!t && !isNaN(t));
    const endsMs = upcoming.map(b => b.serviceEnd?.getTime()).filter((t): t is number => !!t && !isNaN(t));
    const winStart = startsMs.length ? new Date(Math.min(...startsMs)) : null;
    const winEnd = endsMs.length ? new Date(Math.max(...endsMs)) : null;
    let passportWarning: { severity: 'critical' | 'warning'; message: string } | null = null;
    const ppExp = student.passportValidUntil;
    if (ppExp && winStart) {
      if (ppExp < winStart) {
        passportWarning = { severity: 'critical', message: 'Your passport expires before your course starts. You need to renew it before you travel — passport renewals from abroad can take months.' };
      } else if (winEnd && ppExp < winEnd) {
        passportWarning = { severity: 'warning', message: 'Your passport expires while you are here in Ireland. We strongly recommend renewing it before you leave home — renewing a passport abroad is slow and complicated.' };
      }
    }

    return {
      passportWarning,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        nationality: student.nationality,
        birthday: student.birthday,
        phone: student.phoneMobile || student.phone,
        level: student.currentLevel,
        profilePicture: student.profilePicture,
        // Mother tongue — used client-side to translate the "+ Book" button
        // label into the student's own language. May be null.
        language: student.language,
        // Beta-access flag — gates the Learning (LMS) tab during launch.
        beta: student.beta,
        // Surfaced in the Overview "Personal" row (must be on the returned object,
        // not just the select).
        instagramHandle: student.instagramHandle,
        // Null → the app shows the welcome video once, then stamps it seen.
        welcomeVideoSeenAt: student.welcomeVideoSeenAt,
        // Address pair — editable in the Personal section's tap-to-reveal
        // fieldsets, and the Irish address gates the self-service documents
        // that print it. Must be on the returned object, not just the select.
        address: student.address, addressAddon: student.addressAddon, zip: student.zip,
        city: student.city, state: student.state, countryIso: student.countryIso,
        irishAddress: student.irishAddress, irishAddressAddon: student.irishAddressAddon, irishZip: student.irishZip,
        irishCity: student.irishCity, irishState: student.irishState, irishCountryIso: student.irishCountryIso,
      },
      booking: current ? {
        id: current.id,
        serviceStart: current.serviceStart,
        serviceEnd: current.serviceEnd,
        status: current.status,
        // True when the in-view booking hasn't started yet → UI badges "Upcoming".
        isUpcoming,
        // Customer-facing HubSpot invoice share link — surfaced as a "View
        // Invoice" button under the Course card. Quote deliberately omitted
        // (superfluous — the student already has it by email).
        invoiceUrl: (current as any).hubspotInvoiceUrl || null,
      } : null,
      // Counts of the student's OTHER bookings → show/hide the Upcoming →/History →
      // links; the bookings themselves load on demand via GET /bookings/list.
      upcomingCount,
      pastCount,
      course: course ? {
        name: course.name,
        level: course.level,
        startDate: course.startDate,
        endDate: course.endDate,
        weeks: course.weeks,
        hoursPerWeek: course.hoursPerWeek,
      } : null,
      timetable,
      accommodation: accommodationObj,
      attendance: {
        overallPct,
        weekPct,
        totalRecords: total,
        academicYear,
      },
      documents,
    };
  }

  // ── Absence reasons ────────────────────────────
  // The student annotates an absence with why they missed class. Reasons NEVER
  // change attendance % — they're documentation only, used in the exit letter
  // when a student finishes <85% (and possibly cited at IRP renewal).
  const ALLOWED_REASONS = ['SICK', 'IRP_APPT', 'PPS_APPT', 'EXAM', 'TRANSPORT', 'WEATHER', 'OTHER'] as const;
  type Reason = typeof ALLOWED_REASONS[number];

  async function absences(studentId: number, days = 60) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const rows = await prisma.attendance.findMany({
      where: {
        studentId,
        status: { in: ['ABSENT_CERTIFIED', 'ABSENT_UNCERTIFIED', 'EXCUSED'] },
        occurrence: { date: { gte: since } },
      },
      include: {
        occurrence: { include: { class_: { select: { name: true } } } },
      },
      orderBy: { occurrence: { date: 'desc' } },
    });

    const dates = rows.map(r => r.occurrence.date);
    const reasons = dates.length
      ? await prisma.absenceReason.findMany({
          where: { studentId, date: { in: dates } },
          select: {
            date: true, reason: true, noteText: true, submittedAt: true, accepted: true,
            certFiles: { select: { id: true, filename: true, originalName: true }, orderBy: { uploadedAt: 'asc' } },
          },
        })
      : [];
    const byDate = new Map(reasons.map(r => [r.date.toISOString().slice(0, 10), r]));

    return rows.map(r => {
      const iso = r.occurrence.date.toISOString().slice(0, 10);
      const rsn = byDate.get(iso);
      return {
        date: iso,
        status: r.status,
        className: r.occurrence.class_?.name || '',
        reason: rsn?.reason || null,
        noteText: rsn?.noteText || null,
        submittedAt: rsn?.submittedAt || null,
        certs: (rsn?.certFiles || []).map(f => ({ id: f.id, name: f.originalName || f.filename })),
      };
    });
  }

  async function planned(studentId: number, days = 60) {
    // Future-dated absence_reasons rows for this student. Past rows live on
    // the regular /absences endpoint (joined to Attendance). Planned rows
    // exist before the teacher has marked attendance for that day.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() + days);

    const rows = await prisma.absenceReason.findMany({
      where: { studentId, date: { gte: today, lte: horizon } },
      select: {
        date: true, reason: true, noteText: true, submittedAt: true,
        certFiles: { select: { id: true, originalName: true, filename: true }, orderBy: { uploadedAt: 'asc' } },
      },
      orderBy: { date: 'asc' },
    });

    return rows.map(r => ({
      date: r.date.toISOString().slice(0, 10),
      reason: r.reason,
      noteText: r.noteText,
      submittedAt: r.submittedAt,
      certs: r.certFiles.map(f => ({ id: f.id, name: f.originalName || f.filename })),
    }));
  }

  async function recordAbsenceReason(input: {
    studentId: number;
    date: string;        // YYYY-MM-DD
    reason: string;
    noteText?: string;
    submittedBy: string;
  }) {
    const reason = String(input.reason || '').toUpperCase();
    if (!(ALLOWED_REASONS as readonly string[]).includes(reason)) {
      throw new Error('Invalid reason');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Invalid date');
    const date = new Date(input.date + 'T00:00:00Z');

    // Reject Saturdays and Sundays (no classes run). Server-side guard so a
    // student can't pre-tag e.g. a weekend just to hit the form. Past dates
    // are still allowed (post-hoc reason is the dominant case).
    const dayOfWeek = date.getUTCDay(); // 0=Sun, 6=Sat
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new Error('Pick a weekday — no classes run on weekends');
    }

    return prisma.absenceReason.upsert({
      where: { studentId_date: { studentId: input.studentId, date } },
      create: {
        studentId: input.studentId,
        date,
        reason: reason as Reason,
        noteText: input.noteText?.slice(0, 500) || null,
        submittedBy: input.submittedBy,
      },
      update: {
        reason: reason as Reason,
        noteText: input.noteText?.slice(0, 500) || null,
        submittedAt: new Date(),
        // Re-submission resets review state — admin can re-confirm if they want.
        reviewedBy: null,
        reviewedAt: null,
      },
    });
  }

  async function clearAbsenceReason(studentId: number, dateIso: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) throw new Error('Invalid date');
    const date = new Date(dateIso + 'T00:00:00Z');
    // Cascade-delete via the FK takes care of cert rows; we still want to
    // unlink the actual files from disk first.
    const existing = await prisma.absenceReason.findUnique({
      where: { studentId_date: { studentId, date } },
      select: { certFilename: true, certFiles: { select: { filename: true } } },
    });
    if (existing) {
      for (const f of existing.certFiles) await unlinkCert(f.filename);
      if (existing.certFilename) await unlinkCert(existing.certFilename);
    }
    await prisma.absenceReason.deleteMany({ where: { studentId, date } });
    return { ok: true };
  }

  // ── Medical-cert attachment helpers ──────────
  async function unlinkCert(filename: string) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const dir = path.resolve(__dirname, '..', '..', 'uploads', 'medical-certs');
      const abs = path.resolve(dir, filename);
      if (abs.startsWith(dir) && fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch { /* swallow — disk cleanup isn't critical */ }
  }

  const CERT_MAX = 5;

  async function attachAbsenceCert(input: {
    studentId: number; dateIso: string; filename: string; originalName: string; uploadedBy?: string;
  }) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dateIso)) throw new Error('Invalid date');
    const date = new Date(input.dateIso + 'T00:00:00Z');
    const reason = await prisma.absenceReason.findUnique({
      where: { studentId_date: { studentId: input.studentId, date } },
      include: { certFiles: { select: { id: true } } },
    });
    if (!reason) throw new Error('Pick a reason before attaching a cert');
    if (reason.certFiles.length >= CERT_MAX) {
      // Remove the just-saved temp file so we don't leave orphans on disk
      await unlinkCert(input.filename);
      throw new Error(`Maximum ${CERT_MAX} files reached`);
    }
    return prisma.absenceCertFile.create({
      data: {
        absenceReasonId: reason.id,
        filename: input.filename,
        originalName: input.originalName,
        uploadedBy: input.uploadedBy || null,
      },
    });
  }

  async function removeAbsenceCertFile(studentId: number, dateIso: string, fileId: number) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) throw new Error('Invalid date');
    const date = new Date(dateIso + 'T00:00:00Z');
    const reason = await prisma.absenceReason.findUnique({
      where: { studentId_date: { studentId, date } },
      select: { id: true },
    });
    if (!reason) throw new Error('No reason on file for that date');
    const file = await prisma.absenceCertFile.findFirst({
      where: { id: fileId, absenceReasonId: reason.id },
      select: { filename: true },
    });
    if (!file) throw new Error('File not found on this absence');
    await unlinkCert(file.filename);
    await prisma.absenceCertFile.delete({ where: { id: fileId } });
    return { ok: true };
  }

  async function getAbsenceCertFile(studentId: number, dateIso: string, fileId: number) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return null;
    const date = new Date(dateIso + 'T00:00:00Z');
    const reason = await prisma.absenceReason.findUnique({
      where: { studentId_date: { studentId, date } },
      select: { id: true },
    });
    if (!reason) return null;
    return prisma.absenceCertFile.findFirst({
      where: { id: fileId, absenceReasonId: reason.id },
      select: { filename: true, originalName: true },
    });
  }

  // ── Challenges ─────────────────────────────────
  // Engagement layer surfacing six challenge types on /sis/student.
  // Most are self-claim + admin-verify; "Course Attended" is computed live
  // from the Attendance table.

  // Compute attendance % for a date window. Returns null when there are no
  // attendance records yet (e.g. brand-new student, first week not begun).
  function pctForWindow(rows: any[], from: Date) {
    const wnd = rows.filter(r => r.occurrence?.date && r.occurrence.date >= from);
    if (!wnd.length) return null;
    const present = wnd.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    return Math.round((present / wnd.length) * 100);
  }

  async function challenges(studentId?: number) {
    if (!studentId) return { error: 'No student session' };

    const s = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true, firstName: true, lastName: true,
        instagramHandle: true, instagramFollowVerified: true,
        googleReviewUrl: true, googleReviewVerified: true,
        trustpilotReviewUrl: true,
        ambassadorCode: true, ambassadorApprovedAt: true,
      } as any,
    });
    if (!s) return { error: 'Student not found' };

    // Eligibility: student has the Challenges tab iff ANY of their bookings
    // mirrored Booking.hubspotChallenge from a HubSpot Deal (e.g.
    // "KickStart"). Per Neil 2026-05-20: once a student has done a
    // challenge, the visible record stays forever — we don't reset the tab
    // for a second/third booking that has no challenge. So one historical
    // hit is enough to keep the tab on.
    const anyChallengeBooking = await (prisma.booking as any).findFirst({
      where: { studentId, hubspotChallenge: { not: null } },
      select: { id: true, hubspotChallenge: true },
    });
    if (!anyChallengeBooking) {
      return { eligible: false, items: [], progress: { done: 0, total: 0 }, periodKind: 'WEEK' };
    }
    const challengeType: string = anyChallengeBooking.hubspotChallenge;

    // Decide weekly vs monthly window from the student's primary booking.
    // AY/LifePass (>= 12 weeks) → monthly, otherwise → weekly.
    const booking = await prisma.booking.findFirst({
      where: { studentId },
      orderBy: { id: 'desc' },
      select: {
        serviceStart: true, serviceEnd: true,
        courses: { select: { weeks: true }, orderBy: { id: 'desc' }, take: 1 },
      },
    });
    const wks = booking?.courses?.[0]?.weeks ?? null;
    const periodKind: 'WEEK' | 'MONTH' = (wks && wks >= 12) ? 'MONTH' : 'WEEK';

    const today = new Date();
    const from = new Date(today);
    from.setHours(0,0,0,0);
    if (periodKind === 'WEEK') {
      const dow = (from.getDay() + 6) % 7; // Mon = 0
      from.setDate(from.getDate() - dow);
    } else {
      from.setDate(1); // start of current month
    }

    const attRowsAll = await prisma.attendance.findMany({
      where: { studentId },
      select: { status: true, occurrence: { select: { date: true } } },
    });
    // Exclude holiday-overlap days so the student isn't penalised for being
    // off when they're meant to be off.
    const hols = await fetchStudentHolidays(prisma, studentId);
    const attRows = filterOutHolidayDates(attRowsAll, hols);
    const periodPct = pctForWindow(attRows, from);
    // Overall % across the student's whole booking — used as a fallback in
    // the Course Attended challenge when the current week/month hasn't
    // accumulated any attendance rows yet (otherwise the card reads
    // "No attendance yet" even though the student clearly has historical
    // data showing on the Profile tab).
    const overallPct = pctFromRows(attRows, studentId);
    const courseAttendedDone = periodPct !== null && periodPct === 100;

    // Auto-notify Kelly the first time a student hits 100 % in the cycle.
    // The thread row's `notifiedCourse100` flag dedupes within the cycle, so
    // visiting the Challenges tab again on Friday won't re-fire the message.
    if (courseAttendedDone) {
      void notifyChallenge(prisma, studentId, {
        title: '🎯 Attended Course — 100 % unlocked',
        body: `Auto-verified by attendance records. No action needed.`,
        setOnceFlag: 'notifiedCourse100',
      });
    }

    // Content tasks: 3 verified video posts to clear it
    const contentRaw = await (prisma as any).studentChallengeContent.findMany({
      where: { studentId },
      orderBy: { id: 'asc' },
    });
    // Enrich each post with its 14-day measurement window, anchored on the REAL
    // post date (postedAt), falling back to createdAt for legacy rows. There's no
    // upload guard any more — the student may upload the result screenshot at ANY
    // time; the window only decides leaderboard eligibility (checked against the
    // screenshot's own date at upload). `windowOpen` drives friendly messaging.
    const content = contentRaw.map((c: any) => {
      const anchor = c.postedAt ? new Date(c.postedAt) : new Date(c.createdAt);
      const due = new Date(anchor.getTime() + POST_WINDOW_DAYS * 86400000);
      const daysLeft = Math.ceil((due.getTime() - Date.now()) / 86400000);
      return {
        ...c,
        dueAt: due.toISOString(),      // last date a screenshot still counts for the prize
        daysLeft,                       // days left in the window (may be <0 once past it)
        measurable: true,               // no gate — screenshot uploadable any time
        windowOpen: daysLeft > 0,       // still inside the 14-day counting window
        hasMetrics: c.metricsAt != null,
      };
    });
    const verifiedContent = content.filter((c: any) => c.verified).length;
    const contentTasksDone = verifiedContent >= 3;

    const social = !!(s as any).instagramHandle && (s as any).instagramFollowVerified;
    const review = (s as any).googleReviewVerified;
    const ambassador = !!(s as any).ambassadorCode;

    // Attended Social — Kelly marks `attended=true` after the event, and the
    // student earns the unlock once they've attended at least one social
    // activity in the current period (week/month). The card body surfaces a
    // calendar icon so students can browse the wider monthly programme even
    // when this week's slate is light.
    const attendedRows = await (prisma as any).activityAttendee.findMany({
      where: {
        studentId,
        attended: true,
        activity: { date: { gte: from } },
      },
      include: { activity: { select: { id: true, title: true, date: true } } },
    });
    const activityAttendedDone = attendedRows.length >= 1;

    const items = [
      {
        key: 'social',
        label: 'Social Platform',
        icon: '📱',
        done: social,
        state: social ? 'Unlocked' : ((s as any).instagramHandle ? 'Awaiting verification' : 'Add your handle'),
        data: {
          instagramHandle: (s as any).instagramHandle,
          followVerified: (s as any).instagramFollowVerified,
        },
      },
      {
        key: 'content',
        label: 'Progress Posts',
        icon: '🎬',
        done: contentTasksDone,
        state: `${verifiedContent} of 3 verified`,
        data: { content, verified: verifiedContent, target: 3 },
      },
      {
        key: 'course_attended',
        label: 'Attend Course',
        icon: '🎯',
        done: courseAttendedDone,
        state: periodPct !== null
          ? `${periodPct}% this ${periodKind === 'WEEK' ? 'week' : 'month'}`
          : (overallPct !== null ? `${overallPct}% overall` : 'No attendance yet'),
        data: { periodKind, periodPct, overallPct },
      },
      {
        key: 'activity_attended',
        label: 'Attend Social',
        icon: '🎉',
        done: activityAttendedDone,
        state: activityAttendedDone
          ? `${attendedRows.length} attended this ${periodKind === 'WEEK' ? 'week' : 'month'}`
          : 'RSVP & Show Up',
        data: { attended: attendedRows.map((r: any) => ({ activityId: r.activity.id, title: r.activity.title, date: r.activity.date })) },
      },
      {
        // Single "Review" challenge — the Google 5★ is the unlock criterion;
        // Trustpilot URL sits alongside as a secondary backend-tracked field
        // (it's typically captured during booking, not as part of the challenge).
        key: 'review',
        label: 'Review',
        icon: '⭐',
        done: review,
        state: review ? '5★ verified' : ((s as any).googleReviewUrl ? 'Awaiting verification' : 'Submit your Google review link'),
        data: {
          googleUrl: (s as any).googleReviewUrl,
          googleVerified: (s as any).googleReviewVerified,
          trustpilotUrl: (s as any).trustpilotReviewUrl,
        },
      },
      {
        key: 'ambassador',
        label: 'Ambassador',
        icon: '🏆',
        done: ambassador,
        state: ambassador ? 'Unlocked' : 'Unlocks after 5★ Google Review verified',
        data: {
          code: (s as any).ambassadorCode,
          approvedAt: (s as any).ambassadorApprovedAt,
        },
      },
    ];

    // July open-competition cohort (temporary, tagged Booking.hubspotChallenge='July'):
    // focus them on just the two tasks that feed the €500 Progress-Post leaderboard
    // — Connect (Instagram handle + follow) and Progress Posts — hiding the rest of
    // the KickStart suite they never signed up for. KickStart/CashBack keep the full
    // set. Revert = clear the 'July' tag (scripts/tag-july-cohort.js). They still
    // share ONE leaderboard with KickStart (challengeLeaderboard keys on
    // hubspotChallenge != null, so 'July' is already included — no pool change).
    const shownItems = challengeType === 'July'
      ? items.filter(i => i.key === 'social' || i.key === 'content')
      : items;
    const done = shownItems.filter(i => i.done).length;

    return {
      challenge: challengeType,
      progress: { done, total: shownItems.length },
      periodKind,
      items: shownItems,
    };
  }

  // Admin dashboard: every student CURRENTLY in a challenge. "Currently" = a
  // booking whose HubSpot Deal carried a challenge (KickStart/CashBack) and
  // whose course hasn't ended yet (serviceEnd >= today) — so departed students
  // drop off. One row per student (most recent active challenge booking),
  // enriched with the same per-task progress the student sees on their app.
  async function challengesReport(search?: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const bookings = await (prisma.booking as any).findMany({
      where: {
        hubspotChallenge: { not: null },
        serviceEnd: { gte: today },
        // Only COMMITTED bookings: drop CANCELLED and PENDING (PENDING = quote
        // sent, €0 paid — a prospect, not an enrolled student). null status is
        // kept (= not cancelled/pending), same convention as the other reports.
        OR: [{ status: null }, { status: { notIn: ['CANCELLED', 'PENDING'] } }],
      },
      select: { studentId: true, hubspotChallenge: true, serviceStart: true, serviceEnd: true },
      orderBy: { id: 'desc' },
    });

    // Dedup → keep the most recent active challenge booking per student.
    const byStudent = new Map<number, any>();
    for (const b of bookings) if (!byStudent.has(b.studentId)) byStudent.set(b.studentId, b);

    // Search reuses the canonical accent-insensitive name/nickname/email/id
    // matcher (same as the Students list + partner portal) — applied as a
    // post-filter constrained to the challenge cohort.
    let ids = [...byStudent.keys()];
    const term = (search || '').trim();
    if (term && ids.length) {
      const frag = studentSearchSql(term);
      const matched = await prisma.$queryRaw<Array<{ id: number }>>(
        Prisma.sql`SELECT s.id FROM students s WHERE s.id IN (${Prisma.join(ids)}) AND ${frag}`
      );
      const keep = new Set(matched.map(r => Number(r.id)));
      ids = ids.filter(id => keep.has(id));
    }

    const rows: any[] = [];
    const emailByStudent = new Map<number, string>();
    for (const studentId of ids) {
      const b = byStudent.get(studentId);
      const s = await prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true, firstName: true, lastName: true, nickname: true, nationality: true, currentLevel: true, email: true, cardOnFile: true, cardOnFileAt: true },
      });
      if (!s) continue;
      if ((s as any).email) emailByStudent.set(studentId, (s as any).email);
      const ch: any = await challenges(studentId);
      const started = b.serviceStart && new Date(b.serviceStart) <= today;
      rows.push({
        studentId,
        firstName: s.firstName, lastName: s.lastName, nickname: s.nickname,
        nationality: s.nationality, level: s.currentLevel,
        challenge: b.hubspotChallenge,
        serviceStart: b.serviceStart, serviceEnd: b.serviceEnd,
        status: started ? 'In School' : 'Upcoming',
        periodKind: ch?.periodKind || 'WEEK',
        done: ch?.progress?.done ?? 0,
        total: ch?.progress?.total ?? 0,
        // Prize eligibility = whole challenge complete (all tasks).
        eligible: (ch?.progress?.total ?? 0) > 0 && (ch?.progress?.done ?? 0) >= (ch?.progress?.total ?? 0),
        items: (ch?.items || []).map((i: any) => ({ key: i.key, label: i.label, icon: i.icon, done: i.done, state: i.state })),
        leadImpact: null as number | null,
        leadPost: null as any,
        has_account: false,
        cardOnFile: !!(s as any).cardOnFile,
        cardOnFileAt: (s as any).cardOnFileAt || null,
      });
    }

    // Attach each student's LEADING (highest-Impact) Progress Post for the
    // €500 leaderboard — one batched query, max per student.
    const sids = rows.map(r => r.studentId);
    if (sids.length) {
      const posts = await (prisma as any).studentChallengeContent.findMany({
        where: { studentId: { in: sids }, impact: { not: null } },
        select: { studentId: true, impact: true, url: true, views: true, likes: true, comments: true, shares: true },
      });
      const leadBy = new Map<number, any>();
      for (const p of posts) {
        const cur = leadBy.get(p.studentId);
        if (!cur || (p.impact || 0) > (cur.impact || 0)) leadBy.set(p.studentId, p);
      }
      for (const r of rows) {
        const l = leadBy.get(r.studentId);
        if (l) { r.leadImpact = l.impact; r.leadPost = { url: l.url, views: l.views, likes: l.likes, comments: l.comments, shares: l.shares }; }
      }
    }

    // Registration flag — has each student created a ULearn account? Drives the
    // "Account ✓" column. sis_users.email is stored normalised (lowercase) at
    // registration, so an `in` on lowercased emails matches cleanly.
    const accEmails = [...emailByStudent.values()].filter(Boolean).map(e => e.toLowerCase());
    if (accEmails.length) {
      const accts = await prisma.sisUser.findMany({
        where: { email: { in: accEmails }, userType: 'student', active: true },
        select: { email: true },
      });
      const has = new Set(accts.map(a => (a.email || '').toLowerCase()));
      for (const r of rows) {
        const em = emailByStudent.get(r.studentId);
        if (em && has.has(em.toLowerCase())) r.has_account = true;
      }
    }

    rows.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
    return rows;
  }

  // Student updates own social fields. Verification is admin-only — toggling
  // `instagramFollowVerified` or `googleReviewVerified` from this endpoint is
  // ignored (use the admin endpoints).
  async function updateSocial(studentId: number, body: any) {
    const allowed: any = {};
    if ('instagramHandle' in body) {
      const h = (body.instagramHandle || '').toString().trim();
      // Allow null/empty to clear; strip leading @ for storage consistency
      allowed.instagramHandle = h ? h.replace(/^@/, '') : null;
      // Editing handle invalidates prior follow verification; admin must re-tick
      allowed.instagramFollowVerified = false;
    }
    if ('googleReviewUrl' in body) {
      const u = (body.googleReviewUrl || '').toString().trim();
      allowed.googleReviewUrl = u || null;
      // Editing URL invalidates prior verification — and clears ambassador
      allowed.googleReviewVerified = false;
      allowed.ambassadorCode = null;
      allowed.ambassadorApprovedAt = null;
    }
    if ('trustpilotReviewUrl' in body) {
      const u = (body.trustpilotReviewUrl || '').toString().trim();
      allowed.trustpilotReviewUrl = u || null;
    }
    if (Object.keys(allowed).length === 0) return { ok: true, noop: true };
    await prisma.student.update({ where: { id: studentId }, data: allowed as any });

    // Notify Kelly when the student submits/updates a Google review URL —
    // she needs to verify the rating before the Ambassador badge auto-mints.
    if (allowed.googleReviewUrl) {
      void notifyChallenge(prisma, studentId, {
        title: '⭐ Review — link submitted',
        body: [
          `URL: ${allowed.googleReviewUrl}`,
          `${kellyMention()} please confirm it's a 5★ review (anything less = no unlock).`,
        ].join('\n'),
      });
    }
    return { ok: true };
  }

  // Self-certified follow confirmation. The student clicks "I followed" after
  // visiting Instagram; we mark followVerified=true immediately (no API can
  // verify a follower since Meta retired that endpoint) and ping Slack so a
  // staff member can spot-check and revoke if needed. Trust-by-default —
  // friction kills challenge participation, and Kelly can revoke through the
  // admin endpoint if someone games it.
  async function confirmFollow(studentId: number) {
    const s = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true, instagramHandle: true } as any,
    }) as any;
    if (!s) throw new Error('Student not found');
    if (!s.instagramHandle) throw new Error('Add your Instagram handle first');

    // Idempotent — multiple confirms just stay verified.
    await prisma.student.update({
      where: { id: studentId },
      data: { instagramFollowVerified: true } as any,
    });

    // Slack notify (best-effort). Posts as a reply on the student's cycle
    // thread (creates the thread if this is their first event of the week).
    const handle = String(s.instagramHandle).replace(/^@/, '');
    void notifyChallenge(prisma, studentId, {
      title: '📱 Social Platform — follow claimed',
      body: [
        `Handle: <https://instagram.com/${handle}|@${handle}>`,
        `${kellyMention()} please spot-check the followers list; revoke via admin if false.`,
      ].join('\n'),
    });

    return { ok: true, verified: true };
  }

  async function addContentSubmission(studentId: number, body: any) {
    const url = (body.url || '').toString().trim();
    if (!url) throw new Error('URL required');
    // postedAt = the real post date (captured by the "Date posted?" prompt at
    // link time). Anchors the 14-day measurement window. Falls back to createdAt
    // downstream if the student didn't provide it.
    // ANTI-CHEAT: a post can't be dated in the FUTURE — that would push the window
    // out and let the post mature longer than everyone else's (unfair). Backdating
    // is self-penalising (shorter window), so it's allowed. Clamp any future date
    // to now, server-side, so the client `max` can't be bypassed.
    let postedAt = body.postedAt ? new Date(body.postedAt) : null;
    if (postedAt && !isNaN(postedAt.getTime()) && postedAt.getTime() > Date.now()) postedAt = new Date();
    const row = await (prisma as any).studentChallengeContent.create({
      data: {
        studentId,
        url,
        kind: (body.kind || 'VIDEO').toString().toUpperCase(),
        note: body.note || null,
        postedAt: postedAt && !isNaN(postedAt.getTime()) ? postedAt : null,
      },
    });
    // How many of the 3 has the student now submitted? Drives the body text
    // so Kelly knows at a glance whether they've finished the set.
    const total = await (prisma as any).studentChallengeContent.count({ where: { studentId } });
    void notifyChallenge(prisma, studentId, {
      title: `🎬 Progress Posts — video ${total}/3 submitted`,
      body: [
        `URL: ${url}`,
        `${kellyMention()} please review and verify.`,
      ].join('\n'),
    });
    return row;
  }

  async function removeContentSubmission(studentId: number, id: number) {
    // Students may delete their OWN post at any time and start over — including
    // after metrics/verification (they own the entry; the app confirms first).
    const row = await (prisma as any).studentChallengeContent.findUnique({ where: { id } });
    if (!row || row.studentId !== studentId) throw new Error('Not found');
    await (prisma as any).studentChallengeContent.delete({ where: { id } });
    return { deleted: true };
  }

  // KickStart prize: store the day-14 screenshot the student uploads for a
  // Progress Post (relPath is relative to uploads/). The metrics come back via
  // saveContentMetrics after the AI read + student confirm.
  async function attachContentScreenshot(studentId: number, contentId: number, relPath: string, shotDateStr?: string | null) {
    const row = await (prisma as any).studentChallengeContent.findUnique({ where: { id: contentId } });
    if (!row || row.studentId !== studentId) throw new Error('Not found');
    // Eligibility for the €500 leaderboard: the date read from the screenshot must
    // fall within the post's 14-day window (anchored on postedAt, fallback
    // createdAt). If the AI couldn't read a date, leave eligible = null — it still
    // counts (lenient), and the leader is hand-checked at month end regardless.
    const shotDate = shotDateStr ? new Date(shotDateStr + 'T12:00:00Z') : null;  // noon UTC → no TZ off-by-one
    let eligible: boolean | null = null;
    if (shotDate && !isNaN(shotDate.getTime())) {
      const anchor = row.postedAt ? new Date(row.postedAt) : new Date(row.createdAt);
      const due = anchor.getTime() + POST_WINDOW_DAYS * 86400000;
      eligible = shotDate.getTime() <= due;
    }
    await (prisma as any).studentChallengeContent.update({
      where: { id: contentId },
      data: { screenshotPath: relPath, shotDate: (shotDate && !isNaN(shotDate.getTime())) ? shotDate : null, eligible },
    });
    return { ok: true, shotDate: (shotDate && !isNaN(shotDate.getTime())) ? shotDate.toISOString() : null, eligible };
  }

  // Save the confirmed engagement metrics for a Progress Post and (re)compute
  // its Impact. Student-confirmed in the app; the leading entry is hand-checked
  // against the live link at month end, so inflation has no payoff.
  async function saveContentMetrics(
    studentId: number,
    contentId: number,
    m: { views?: number | null; likes?: number | null; comments?: number | null; reposts?: number | null; shares?: number | null; saves?: number | null },
  ) {
    const row = await (prisma as any).studentChallengeContent.findUnique({ where: { id: contentId } });
    if (!row || row.studentId !== studentId) throw new Error('Not found');
    const clean = (v: any) => { const x = Math.round(Number(v)); return Number.isFinite(x) && x >= 0 ? x : null; };
    const views = clean(m.views), likes = clean(m.likes), comments = clean(m.comments);
    const reposts = clean(m.reposts), shares = clean(m.shares), saves = clean(m.saves);
    const impact = computeImpact({ views, likes, comments, reposts, shares, saves });
    const updated = await (prisma as any).studentChallengeContent.update({
      where: { id: contentId },
      data: { views, likes, comments, reposts, shares, saves, impact, metricsAt: new Date() },
      select: { id: true, views: true, likes: true, comments: true, reposts: true, shares: true, saves: true, impact: true, metricsAt: true },
    });
    return updated;
  }

  // Student-facing €500 leaderboard: ranks the current challenge cohort by each
  // student's LEADING (highest-Impact) Progress Post. Light query (no per-student
  // challenges() recompute) — cohort bookings + max-impact per student.
  async function challengeLeaderboard(studentId: number) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const bookings = await (prisma.booking as any).findMany({
      where: { hubspotChallenge: { not: null }, serviceEnd: { gte: today }, OR: [{ status: null }, { status: { notIn: ['CANCELLED', 'PENDING'] } }] },
      select: { studentId: true },
    });
    const sids = [...new Set(bookings.map((b: any) => b.studentId))] as number[];
    if (!sids.length) return { prize: 500, total: 0, top: [], me: null };

    const students = await prisma.student.findMany({ where: { id: { in: sids } }, select: { id: true, firstName: true, lastName: true, nickname: true } });
    const sById = new Map(students.map(s => [s.id, s]));
    // Only leaderboard-eligible posts count (eligible=false = screenshot past the
    // 14-day window; null = lenient, hand-checked at month end). SCOPED to the
    // CURRENT competition month (post's window-end month = posted_at+14d) so the
    // student board shows THIS month's race and resets each month — past months
    // live on the admin's month-selectable leaderboard.
    const nowMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const posts: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT student_id AS "studentId", impact FROM student_challenge_content
       WHERE student_id = ANY($1::int[]) AND impact IS NOT NULL AND eligible IS NOT false
         AND to_char((COALESCE(posted_at, created_at) + interval '14 days'),'YYYY-MM') = $2`,
      sids, nowMonth);
    const impBy = new Map<number, number>();
    for (const p of posts) { const cur = impBy.get(p.studentId) || 0; if ((p.impact || 0) > cur) impBy.set(p.studentId, p.impact || 0); }

    const nameOf = (s: any) => s ? ((s.nickname || s.firstName || 'Student') + (s.lastName ? ' ' + s.lastName.charAt(0) + '.' : '')) : 'Student';
    const ranked = [...impBy.keys()].map(id => ({ id, impact: impBy.get(id)! })).sort((a, b) => b.impact - a.impact);
    const total = ranked.length;
    const top = ranked.slice(0, 10).map((r, i) => ({ rank: i + 1, name: nameOf(sById.get(r.id)), impact: Math.round(r.impact), isMe: r.id === studentId }));
    const myIdx = ranked.findIndex(r => r.id === studentId);
    const me = myIdx >= 0
      ? { rank: myIdx + 1, impact: Math.round(ranked[myIdx].impact), of: total }
      : { rank: null, impact: null, of: total, inCohort: sids.includes(studentId) };
    return { prize: 500, total, top, me, month: nowMonth };
  }

  // Staff-side mirror of the student-app leaderboard. Same cohort + ranking as
  // challengeLeaderboard, but returns the FULL ranked list with full names +
  // post counts (staff see everything; no top-10 cap, no name abbreviation).
  async function challengeLeaderboardAdmin() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const bookings = await (prisma.booking as any).findMany({
      where: { hubspotChallenge: { not: null }, serviceEnd: { gte: today }, OR: [{ status: null }, { status: { notIn: ['CANCELLED', 'PENDING'] } }] },
      select: { studentId: true },
    });
    const sids = [...new Set(bookings.map((b: any) => b.studentId))] as number[];
    if (!sids.length) return { prize: 500, total: 0, rows: [] };

    const students = await prisma.student.findMany({ where: { id: { in: sids } }, select: { id: true, firstName: true, lastName: true, nickname: true } });
    const sById = new Map(students.map(s => [s.id, s]));
    // Only leaderboard-eligible posts count — a screenshot dated past the post's
    // 14-day window (eligible=false) is stored but excluded. null = lenient (AI
    // couldn't read a date) → still counts, hand-checked at month end.
    const posts = await (prisma as any).studentChallengeContent.findMany({ where: { studentId: { in: sids }, impact: { not: null }, NOT: { eligible: false } }, select: { studentId: true, impact: true } });
    const impBy = new Map<number, number>();
    const postCount = new Map<number, number>();
    for (const p of posts) {
      const cur = impBy.get(p.studentId) || 0;
      if ((p.impact || 0) > cur) impBy.set(p.studentId, p.impact || 0);
      postCount.set(p.studentId, (postCount.get(p.studentId) || 0) + 1);
    }
    const fullName = (s: any) => s ? ([s.firstName, s.lastName].filter(Boolean).join(' ') || s.nickname || 'Student') : 'Student';
    const ranked = [...impBy.keys()]
      .map(id => ({ id, impact: impBy.get(id)!, posts: postCount.get(id) || 0 }))
      .sort((a, b) => b.impact - a.impact);
    const rows = ranked.map((r, i) => ({
      rank: i + 1,
      studentId: r.id,
      name: fullName(sById.get(r.id)),
      nickname: (sById.get(r.id) as any)?.nickname || null,
      impact: Math.round(r.impact),
      posts: r.posts,
    }));
    return { prize: 500, total: rows.length, rows };
  }

  // Admin HISTORICAL leaderboard, scoped to a competition MONTH so past months
  // (e.g. July's winner) are retained after the cohort rolls off. The competition
  // month of a post = the month its 14-day window ENDS (posted_at + 14d), matching
  // how the prize month is decided. Recomputed live from the persisted posts — no
  // snapshot needed since the posts don't change once a month closes. Defaults to
  // the latest month that has any scored, eligible post. Student app stays current-month.
  async function challengeLeaderboardByMonth(monthKey?: string | null) {
    const COMP = `to_char((COALESCE(posted_at, created_at) + interval '14 days'),'YYYY-MM')`;
    const monthRows: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT DISTINCT ${COMP} m FROM student_challenge_content
       WHERE impact IS NOT NULL AND eligible IS NOT false ORDER BY 1 DESC`);
    const months = monthRows.map(r => r.m).filter(Boolean);
    const month = (monthKey && months.includes(monthKey)) ? monthKey : (months[0] || null);
    if (!month) return { prize: 500, month: null, months: [], total: 0, rows: [] };
    const posts: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT student_id AS "studentId", impact FROM student_challenge_content
       WHERE impact IS NOT NULL AND eligible IS NOT false AND ${COMP} = $1`, month);
    const impBy = new Map<number, number>(); const postCount = new Map<number, number>();
    for (const p of posts) {
      if ((p.impact || 0) > (impBy.get(p.studentId) || 0)) impBy.set(p.studentId, p.impact || 0);
      postCount.set(p.studentId, (postCount.get(p.studentId) || 0) + 1);
    }
    const sids = [...impBy.keys()];
    const students = await prisma.student.findMany({ where: { id: { in: sids } }, select: { id: true, firstName: true, lastName: true, nickname: true } });
    const sById = new Map(students.map(s => [s.id, s]));
    const fullName = (s: any) => s ? ([s.firstName, s.lastName].filter(Boolean).join(' ') || s.nickname || 'Student') : 'Student';
    const rows = sids
      .map(id => ({ id, impact: impBy.get(id)!, posts: postCount.get(id) || 0 }))
      .sort((a, b) => b.impact - a.impact)
      .map((r, i) => ({ rank: i + 1, studentId: r.id, name: fullName(sById.get(r.id)), nickname: (sById.get(r.id) as any)?.nickname || null, impact: Math.round(r.impact), posts: r.posts }));
    return { prize: 500, month, months, total: rows.length, rows };
  }

  // ── Admin verify endpoints (for the staff side) ─────────────
  // Toggling googleReviewVerified → true also mints an ambassador code.
  async function adminSetVerify(studentId: number, body: any, byUser: string | null) {
    const data: any = {};
    if ('instagramFollowVerified' in body) data.instagramFollowVerified = !!body.instagramFollowVerified;
    if ('googleReviewVerified' in body) {
      data.googleReviewVerified = !!body.googleReviewVerified;
      if (data.googleReviewVerified) {
        // Mint a code if there isn't one already
        const existing = await prisma.student.findUnique({
          where: { id: studentId },
          select: { firstName: true, ambassadorCode: true } as any,
        });
        if (existing && !(existing as any).ambassadorCode) {
          const fn = String((existing as any).firstName || 'STUDENT');
          const slug = fn.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
          data.ambassadorCode = `${slug}-${studentId}`;
          data.ambassadorApprovedAt = new Date();
        }
      } else {
        // Unverifying clears the ambassador
        data.ambassadorCode = null;
        data.ambassadorApprovedAt = null;
      }
    }
    if (Object.keys(data).length === 0) return { ok: true, noop: true };
    await prisma.student.update({ where: { id: studentId }, data });
    return { ok: true, by: byUser };
  }

  async function adminVerifyContent(contentId: number, verified: boolean, byUser: string | null) {
    const data: any = {
      verified,
      verifiedBy: verified ? byUser : null,
      verifiedAt: verified ? new Date() : null,
    };
    return (prisma as any).studentChallengeContent.update({ where: { id: contentId }, data });
  }

  // Admin: delete a Progress Post outright (e.g. spam / wrong link / duplicate).
  async function adminDeleteContent(contentId: number) {
    await (prisma as any).studentChallengeContent.delete({ where: { id: contentId } });
    return { deleted: true };
  }

  async function learning() {
    // LMS surface stub — handover/redirect to the migrated LMS on the SIS host.
    return { lmsUrl: 'https://sis.ulearnschool.com/prototype/' };
  }

  // ── Student self-service booking ────────────────────────────────────
  // The "+ Book" button in the student app: an existing student books a new
  // course / extension. This is the THIRD booking surface (after the Drupal
  // front-end form and the partner portal). It always represents a
  // CONTINUATION — these are existing students — so:
  //   • continuation = Yes  → HubSpot autoQuote charges no registration fee
  //   • no challenge/KickStart (that promo is for brand-new enrolments only)
  //   • continuation_accomm = Yes when accommodation is added → no accom fee
  //   • createquote = true  → fires the HubSpot autoQuote workflow
  // The deal is routed to the partner B2B pipeline if the student belongs to an
  // agency, otherwise to Direct Sales (B2C). No second contact is ever created;
  // the deal hangs off the student's existing HubSpot contact. A staff task is
  // dropped on the deal as the "please send the quotation" nudge.
  async function book(studentId: number | undefined, data: any) {
    if (!studentId) return { success: false, error: 'No student session' };
    if (!HUBSPOT_PAT) return { success: false, error: 'HubSpot not configured' };
    if (!data?.courseType) return { success: false, error: 'Please choose a course.' };

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true, email: true, nationality: true, hubspotContactId: true },
    });
    if (!student) return { success: false, error: 'Student not found' };

    // Partner relationship comes from the student's current/most-recent booking
    // (agency lives on Booking, not Student). Picks the active service window,
    // else the most recent booking.
    const today = new Date();
    const bookings = await prisma.booking.findMany({
      where: { studentId },
      orderBy: { serviceStart: 'desc' },
      select: {
        serviceStart: true, serviceEnd: true, agencyId: true,
        agency: { select: { primaryEntityId: true, primaryEntityType: true } },
      },
    });
    const curBooking = bookings.find(b =>
      b.serviceStart && b.serviceEnd && b.serviceStart <= today && b.serviceEnd >= today
    ) || bookings[0] || null;
    const hasAgency = !!curBooking?.agencyId;
    const agency = curBooking?.agency || null;

    const nationality = data.nationality || student.nationality || '';

    // 1. Resolve the EXISTING HubSpot contact — never create a second contact
    //    for a known student. Prefer the stored id; fall back to an email
    //    search; only create as a last resort (legacy record with no link).
    let contactId: string | null = student.hubspotContactId || null;
    if (!contactId && student.email) {
      const search = await hsRequest('POST', '/crm/v3/objects/contacts/search', {
        filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: student.email }] }],
        properties: ['email'], limit: 1,
      });
      contactId = search?.results?.[0]?.id || null;
    }
    if (!contactId) {
      const props: Record<string, string> = {
        firstname: student.firstName || '', lastname: student.lastName || '',
        nationality, type: hasAgency ? 'Student-B2B' : 'Student-B2C',
      };
      if (student.email) props.email = student.email;
      const c = await hsRequest('POST', '/crm/v3/objects/contacts', { properties: props });
      contactId = c?.id || (c?.category === 'CONFLICT' ? (c.message?.match(/Existing ID: (\d+)/)?.[1] || null) : null);
      // Backfill the link so future bookings skip the lookup.
      if (contactId && student.hubspotContactId !== contactId) {
        try { await prisma.student.update({ where: { id: studentId }, data: { hubspotContactId: contactId } }); } catch { /* unique race — non-fatal */ }
      }
    }
    if (!contactId) return { success: false, error: 'Could not resolve your HubSpot contact.' };

    // 2. Build the deal — shared course/accom/extras mapping + continuation flags.
    const dealProps: Record<string, any> = {
      dealname: `${student.firstName} ${student.lastName} — Continuation`,
      pipeline: hasAgency ? B2B_PIPELINE : DIRECT_PIPELINE,
      dealstage: hasAgency ? ENROLMENT_STAGE : DIRECT_CONTRACT_STAGE,
      ...buildBaseDealProps({ ...data, nationality }),
      continuation: 'Yes',
      createquote: 'true',
    };
    if (data.accommType && data.accommType !== 'none') dealProps.continuation_accomm = 'Yes';

    const dealRes = await hsRequest('POST', '/crm/v3/objects/deals', { properties: dealProps });
    if (!dealRes.id) return { success: false, error: dealRes.message || 'Failed to create deal in HubSpot' };
    const dealId = dealRes.id;

    // 3. Associate deal ↔ student contact: default (3) + the student label
    //    matching the partner-portal convention (B2C=1, B2B=11).
    const studentLabel = hasAgency ? 11 : 1;
    await hsRequest('PUT', `/crm/v4/objects/deals/${dealId}/associations/contacts/${contactId}`,
      [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 },
       { associationCategory: 'USER_DEFINED', associationTypeId: studentLabel }]);

    // 4. Partner students — tie the deal to the agency's primary entity exactly
    //    as the partner portal does (company=5, or sole-trader contact=13).
    if (hasAgency && agency?.primaryEntityId) {
      if (agency.primaryEntityType === 'company') {
        await hsRequest('PUT', `/crm/v4/objects/deals/${dealId}/associations/companies/${agency.primaryEntityId}`,
          [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }]);
      } else if (agency.primaryEntityType === 'contact' && agency.primaryEntityId !== contactId) {
        await hsRequest('PUT', `/crm/v4/objects/deals/${dealId}/associations/contacts/${agency.primaryEntityId}`,
          [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 },
           { associationCategory: 'USER_DEFINED', associationTypeId: 13 }]);
      }
    }

    // 5. Staff task on the deal — the "please send the quotation" nudge.
    //    autoQuote drafts the quote; a human still reviews & sends. Non-fatal.
    try {
      const summary = [mapCourseType({ ...data, nationality })];
      if (data.courseWeeks) summary.push(`${data.courseWeeks}w`);
      if (data.courseStart) summary.push(`from ${data.courseStart}`);
      if (data.accommType && data.accommType !== 'none') summary.push('+ accommodation');
      await hsRequest('POST', '/crm/v3/objects/tasks', {
        properties: {
          hs_task_subject: `Quotation — ${student.firstName} ${student.lastName} (student self-booking)`,
          hs_task_body:
            `${student.firstName} ${student.lastName} booked a continuation via the student app.\n` +
            `Course: ${summary.join(' · ')}.\n` +
            `Continuation (no registration fee). Auto-quote requested — review & send the quotation.`,
          hs_task_status: 'NOT_STARTED',
          hs_task_priority: 'HIGH',
          hs_task_type: 'TODO',
          hs_timestamp: Date.now(),
        },
        associations: [{ to: { id: dealId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 216 }] }],
      });
    } catch { /* task is a nicety — never fail the booking on it */ }

    return { success: true, dealId };
  }

  // ── "Message us" — student → school support email ───────────────────
  // Logged-in student contacts the school from the app. Sends to
  // success@ulearnschool.com via the existing sendStudentEmail (SES + EmailLog),
  // replyTo = the student so staff just hit Reply. Identity/context is appended
  // server-side so staff don't have to look anything up. No new tables.
  async function support(studentId: number | undefined, data: any) {
    if (!studentId) return { success: false, error: 'No student session' };
    const topic = String(data?.topic || 'Other').slice(0, 40);
    const message = String(data?.message || '').trim();
    if (!message) return { success: false, error: 'Please type a message.' };

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true, email: true, currentLevel: true, nationality: true, phoneMobile: true, phone: true },
    });
    if (!student) return { success: false, error: 'Student not found' };

    // Light current-context for the staff-facing identity block.
    const today = new Date();
    const booking = await prisma.booking.findFirst({
      where: { studentId, serviceStart: { lte: today }, serviceEnd: { gte: today } },
      orderBy: { serviceStart: 'desc' },
      select: { serviceStart: true, serviceEnd: true, courses: { orderBy: { startDate: 'desc' }, take: 1, select: { name: true } } },
    });
    const assignment: any = await prisma.studentClassAssignment.findFirst({
      where: { studentId, weekStart: { lte: today }, OR: [{ weekEnd: null }, { weekEnd: { gte: today } }] },
      orderBy: { weekStart: 'desc' },
      select: { class_: { select: { name: true } } } as any,
    });

    const esc = (s: any) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const name = [student.firstName, student.lastName].filter(Boolean).join(' ');
    const courseName = booking?.courses?.[0]?.name || '—';
    const className = assignment?.class_?.name || '—';
    const phone = student.phoneMobile || student.phone || '—';

    const html =
      `<p style="white-space:pre-wrap;font-size:15px;line-height:1.55">${esc(message)}</p>` +
      `<hr style="border:none;border-top:1px solid #e2e8f0;margin:18px 0">` +
      `<p style="font-size:13px;color:#555;margin:0;line-height:1.7">` +
      `<strong>Sent from the Student App</strong> · Topic: ${esc(topic)}<br>` +
      `Student: <strong>${esc(name)}</strong> (#${student.id})<br>` +
      `Email: ${esc(student.email || '—')} · Phone: ${esc(phone)}<br>` +
      `Nationality: ${esc(student.nationality || '—')} · Level: ${esc(student.currentLevel || '—')}<br>` +
      `Course: ${esc(courseName)} · Class: ${esc(className)}` +
      `</p>`;

    try {
      const sent = await sendStudentEmail(prisma, {
        from: 'app@ulearnschool.com',
        fromName: 'ULearn Student App',
        to: 'app@ulearnschool.com',
        subject: `[Student Support · ${topic}] ${name} (#${student.id})`,
        html,
        replyTo: student.email || undefined,
        studentId: student.id,
        sentBy: 'student-app',
      });
      return { success: true, emailLogId: (sent as any)?.emailLogId ?? null, studentFirst: student.firstName };
    } catch (e: any) {
      return { success: false, error: 'Could not send your message. Please try again, or email app@ulearnschool.com.' };
    }
  }

  // ── Student holiday request (self-service, direct write + notify) ───────────
  // The student picks a Monday start + a number of weeks. It writes straight to
  // the database (creates the BookingHoliday, which shunts the course end) and
  // emails success@ so staff are notified and can veto/adjust in SIS. Guards:
  // AY/LifePass + non-EU only; notice-period minimum (set it up to 08:30 Dublin
  // the Monday it starts — 30 min before class); and the remaining holiday
  // allowance for the current course (10 wks).
  async function requestHoliday(studentId: number | undefined, data: any) {
    if (!studentId) return { success: false, error: 'No student session' };
    const startIso = String(data?.startDate || '').slice(0, 10);
    const weeks = parseInt(String(data?.weeks), 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startIso)) return { success: false, error: 'Pick a start date.' };
    if (!Number.isInteger(weeks) || weeks < 1) return { success: false, error: 'Choose how many weeks.' };

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true, email: true, nationality: true },
    });
    if (!student) return { success: false, error: 'Student not found' };
    if (student.nationality && EU_EEA_CH.has(student.nationality.trim().toLowerCase())) {
      return { success: false, error: 'Work-study holidays apply only to non-EU visa students.' };
    }

    // Build in UTC so @db.Date + iso() never drift a day under Dublin DST (see
    // reference_utc_date_math). The notice-period floor is checked AFTER course
    // resolution below — the cut-off time depends on the student's session
    // (morning vs afternoon class).
    const start = new Date(startIso + 'T00:00:00Z');
    if (start.getUTCDay() !== 1) return { success: false, error: 'Holidays start on a Monday.' };

    // Resolve the Academic-Year booking + the course this holiday lands in.
    const bookings = await prisma.booking.findMany({
      where: { studentId, status: { not: 'CANCELLED' } },
      select: { id: true, courses: { select: { name: true, category: true, startDate: true, endDate: true, holidayWks: true, isRenewal: true } } },
      orderBy: { serviceStart: 'desc' },
    });
    const isAY = (c: any) => c.holidayWks != null || /academic year|life ?pass|renewal/i.test(c.name || '') || c.isRenewal;
    let booking: typeof bookings[number] | undefined;
    let course: any;
    for (const b of bookings) {
      const hit = b.courses.filter(isAY).find(c => c.startDate && c.endDate && +new Date(c.startDate) <= +start && +start <= +new Date(c.endDate) + 86400000);
      if (hit) { booking = b; course = hit; break; }
    }
    if (!booking) {
      // No course covers the chosen Monday — fall back to the current/most-recent AY booking so staff still get the request, but flag it.
      const withAy = bookings.find(b => b.courses.some(isAY));
      if (!withAy) return { success: false, error: 'No Academic Year course on file — holidays apply to work-study students only.' };
      booking = withAy;
      course = withAy.courses.filter(isAY).sort((a, b2) => +new Date(b2.startDate!) - +new Date(a.startDate!))[0];
    }

    // Notice-period floor (session-specific). You can set a holiday for a Monday
    // right up to 30 min before your class that day — 08:30 Dublin for a morning
    // student, 13:15 for an afternoon one — after which the earliest selectable
    // Monday rolls to the next week.
    const cutoff = holidayCutoffForCourse(course);
    const earliest = earliestHolidayStartMonday(new Date(), cutoff);
    if (start < earliest) {
      const clock = cutoff.h === 13 ? '1:15pm' : '8:30am';
      return { success: false, error: `Too soon — the earliest holiday you can start is Monday ${iso(earliest)} (set it up by ${clock} the Monday it starts, 30 minutes before class).` };
    }

    // Remaining allowance for THIS course (10 weeks less what's already taken in
    // its window) — a hard cap from the student's side.
    const entitlement = Number(course.holidayWks ?? 10);
    const cs = course.startDate ? +new Date(course.startDate) : -Infinity;
    const ce = course.endDate ? +new Date(course.endDate) : Infinity;
    const taken = await prisma.bookingHoliday.findMany({ where: { bookingId: booking.id }, select: { startDate: true, endDate: true, weeks: true } });
    const takenWeeks = taken.filter(h => +new Date(h.startDate) <= ce && +new Date(h.endDate) >= cs).reduce((s, h) => s + (h.weeks || 0), 0);
    const remaining = Math.max(0, entitlement - takenWeeks);
    if (weeks > remaining) {
      return { success: false, error: remaining === 0
        ? `You've used your full ${entitlement}-week holiday allowance for this year.`
        : `That's ${weeks} weeks but you only have ${remaining} week${remaining === 1 ? '' : 's'} of holiday left this year.` };
    }

    // Holiday-timing rules (hard, student self-service): no holidays in weeks
    // 1–2; a 6-week in-course cap (4 weeks held for after the course); and the
    // ISD cumulative one-third/no-front-loading check. See lib/ilep-holiday.ts
    // + .claude/tmp/SIS_Holiday_Rules_Claude_Code_Handover.md.
    let ilep: ReturnType<typeof checkIlepAllowance> | null = null;
    if (course.startDate) {
      const inCourse = taken.filter(h => +new Date(h.startDate) <= ce && +new Date(h.endDate) >= cs);
      ilep = checkIlepAllowance(new Date(course.startDate), inCourse, start, weeks);
      if (!ilep.ok) return { success: false, error: ilep.error };
    }

    // End = Friday of the final week (Mon + (weeks-1)*7 + 4 days).
    const end = new Date(start); end.setUTCDate(start.getUTCDate() + (weeks - 1) * 7 + 4);
    // Overlap guard — reject a collision with an existing holiday.
    const clash = taken.find(h => +new Date(h.startDate) <= +end && +new Date(h.endDate) >= +start);
    if (clash) return { success: false, error: 'That overlaps a holiday you already have. Pick different dates.' };
    // Write via addHoliday so the holiday SHUNTS the course end forward — the
    // student keeps all 25 tuition weeks (a mid-course holiday is a break from
    // class, not lost class). force:true — eligibility + the per-course 10-week
    // allowance are already validated above.
    let result: any;
    try {
      result = await bookingScripts(prisma).addHoliday(booking.id, { startDate: iso(start), endDate: iso(end), type: 'student', force: true });
    } catch (e: any) {
      return { success: false, error: String(e?.message || e).replace(/^⚠\s*/, '') };
    }

    // Compliance audit: the capped (6th) in-course week is a provisional
    // management decision, NOT an ISD approval — pin an auditable note to the
    // holiday row so staff review it rather than treat it as compliant.
    const complianceFlag = !!(ilep && ilep.ok && ilep.complianceFlag);
    if (complianceFlag && result?.holiday?.id) {
      try {
        await prisma.entityNote.upsert({
          where: { entityType_entityId: { entityType: 'holiday', entityId: result.holiday.id } },
          create: {
            bookingId: booking.id, entityType: 'holiday', entityId: result.holiday.id,
            createdBy: 'student-app',
            body: `⚠ COMPLIANCE REVIEW (rule ${(ilep as any).ruleVersion}): ${(ilep as any).complianceReason}`,
          },
          update: { body: `⚠ COMPLIANCE REVIEW (rule ${(ilep as any).ruleVersion}): ${(ilep as any).complianceReason}` },
        });
      } catch { /* audit note is best-effort — the holiday is already saved */ }
    }

    // Notify success@ (staff can veto/adjust in SIS). Never fail the request on email.
    const name = [student.firstName, student.lastName].filter(Boolean).join(' ');
    const esc = (s: any) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const SIS = 'https://sis.ulearnschool.com/sis/admin';
    const studentUrl = `${SIS}?view=student-detail&id=${student.id}`;
    const bookingUrl = `${SIS}?view=booking-detail&id=${booking.id}`;
    const lnk = 'color:#2563eb;text-decoration:none;font-weight:600';
    try {
      await sendStudentEmail(prisma, {
        from: 'app@ulearnschool.com',
        fromName: 'ULearn Student App',
        to: 'success@ulearnschool.com',
        subject: `${complianceFlag ? '⚠ [Holiday — COMPLIANCE REVIEW] ' : '[Holiday Request] '}${name} (#${student.id}) — ${weeks} wk from ${iso(start)}`,
        html:
          (complianceFlag
            ? `<p style="font-size:14px;line-height:1.6;background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:10px 12px;margin:0 0 12px;color:#92400e"><strong>⚠ Compliance review.</strong> ${esc((ilep as any).complianceReason)}</p>`
            : '') +
          `<p style="font-size:15px;line-height:1.6"><a href="${studentUrl}" style="${lnk}">${esc(name)}</a> has requested a holiday through the Student App.</p>` +
          `<p style="font-size:15px;line-height:1.8;margin:0 0 4px">` +
          `<strong>Booking:</strong> <a href="${bookingUrl}" style="${lnk}">#${booking.id} · ${esc(course?.name || '—')}</a><br>` +
          `<strong>Dates:</strong> ${iso(start)} → ${iso(end)} (${weeks} week${weeks === 1 ? '' : 's'})<br>` +
          `<strong>In-course holidays:</strong> ${(ilep && ilep.ok) ? (ilep as any).inCourseWeeks : (takenWeeks + weeks)} of ${HOLIDAY_IN_COURSE_CAP} allowed during the course<br>` +
          `<strong>Allowance:</strong> ${takenWeeks + weeks} of ${entitlement} weeks used this year (${remaining - weeks} left)</p>` +
          `<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">` +
          `<p style="font-size:13px;color:#555;line-height:1.6">Holiday recorded in SIS. If you need to veto it for any reason you can do so. Otherwise it will proceed as indicated by the Student Request.</p>`,
        replyTo: student.email || undefined,
        studentId: student.id,
        sentBy: 'student-app',
      });
    } catch { /* email is a nicety — the holiday is already saved */ }

    return { success: true, startDate: iso(start), endDate: iso(end), weeks, remaining: remaining - weeks, shunted: result?.weekdaysPushed || 0, complianceFlag, inCourseWeeks: (ilep && ilep.ok) ? (ilep as any).inCourseWeeks : undefined };
  }

  // Cancel a holiday the student previously booked — only one that hasn't started
  // yet. Rolls back the course shunt (removeHoliday) and notifies success@.
  async function cancelHoliday(studentId: number | undefined, holidayId: any) {
    if (!studentId) return { success: false, error: 'No student session' };
    const hid = parseInt(String(holidayId), 10);
    if (!Number.isInteger(hid)) return { success: false, error: 'Bad holiday id' };
    const hol = await prisma.bookingHoliday.findUnique({
      where: { id: hid },
      select: { id: true, type: true, startDate: true, endDate: true, weeks: true, bookingId: true, booking: { select: { studentId: true, courses: { select: { name: true }, take: 1 } } } },
    });
    if (!hol || hol.booking?.studentId !== studentId) return { success: false, error: 'Holiday not found' };
    // School closures (Christmas etc.) are compulsory — the school is shut, so the
    // student cannot remove them. Only their own requested holidays are cancellable.
    if (hol.type !== 'student') {
      return { success: false, error: 'This is a school closure and cannot be cancelled — the school is closed during this period.' };
    }
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    if (+new Date(hol.startDate) <= +today) {
      return { success: false, error: 'This holiday has already started — please contact the school to change it.' };
    }

    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { firstName: true, lastName: true, email: true } });
    try {
      await bookingScripts(prisma).removeHoliday(hid);
    } catch (e: any) {
      return { success: false, error: String(e?.message || e) };
    }

    // Notify success@ (never fail the cancellation on email).
    const name = [student?.firstName, student?.lastName].filter(Boolean).join(' ');
    const esc = (s: any) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const SIS = 'https://sis.ulearnschool.com/sis/admin';
    const lnk = 'color:#2563eb;text-decoration:none;font-weight:600';
    try {
      await sendStudentEmail(prisma, {
        from: 'app@ulearnschool.com',
        fromName: 'ULearn Student App',
        to: 'success@ulearnschool.com',
        subject: `[Holiday Cancelled] ${name} (#${studentId}) — was ${iso(hol.startDate)}`,
        html:
          `<p style="font-size:15px;line-height:1.6"><a href="${SIS}?view=student-detail&id=${studentId}" style="${lnk}">${esc(name)}</a> has <strong>cancelled</strong> a holiday in the Student App.</p>` +
          `<p style="font-size:15px;line-height:1.8;margin:0 0 4px">` +
          `<strong>Booking:</strong> <a href="${SIS}?view=booking-detail&id=${hol.bookingId}" style="${lnk}">#${hol.bookingId} · ${esc(hol.booking?.courses?.[0]?.name || '—')}</a><br>` +
          `<strong>Was:</strong> ${iso(hol.startDate)} → ${iso(hol.endDate)} (${hol.weeks || ''} week${hol.weeks === 1 ? '' : 's'})</p>` +
          `<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">` +
          `<p style="font-size:13px;color:#555;line-height:1.6">The holiday has been removed and the course end date rolled back. Their allowance is freed up again.</p>`,
        replyTo: student?.email || undefined,
        studentId,
        sentBy: 'student-app',
      });
    } catch { /* email is a nicety — the cancellation is already done */ }

    return { success: true };
  }

  // Student's own holidays (requested/granted) — chronological, for the app list.
  async function holidaysList(studentId: number | undefined) {
    if (!studentId) return [];
    const rows = await prisma.bookingHoliday.findMany({
      where: { booking: { studentId } },
      orderBy: { startDate: 'desc' },
      select: { id: true, startDate: true, endDate: true, weeks: true, type: true, createdAt: true },
    });
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    return rows.map(h => ({
      id: h.id,
      startDate: iso(h.startDate),
      endDate: iso(h.endDate),
      weeks: h.weeks,
      type: h.type,
      createdAt: h.createdAt,
      // Only the student's OWN upcoming holidays can be cancelled in-app. School
      // closures (type='school', e.g. Christmas) are compulsory and locked.
      cancellable: h.type === 'student' && +new Date(h.startDate) > +today,
    }));
  }

  return {
    me, bookingsList, absences, planned, book, support,
    requestHoliday, holidaysList, cancelHoliday,
    recordAbsenceReason, clearAbsenceReason,
    attachAbsenceCert, removeAbsenceCertFile, getAbsenceCertFile,
    challenges, challengesReport, learning,
    updateSocial, confirmFollow, addContentSubmission, removeContentSubmission,
    attachContentScreenshot, saveContentMetrics, challengeLeaderboard, challengeLeaderboardAdmin, challengeLeaderboardByMonth,
    adminSetVerify, adminVerifyContent, adminDeleteContent,
  };
}
