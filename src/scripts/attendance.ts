import { PrismaClient } from '../generated/prisma/client';
import { emailTemplateWhere } from './email-templates';

export function attendanceScripts(prisma: PrismaClient) {

  // ── Get or create class occurrence for a date ──
  // Two normalisations on the way in:
  //   1) Snap the date to UTC-midnight via Date.UTC(y,m,d) using the local
  //      Y/M/D. Without this, a local-midnight Date in BST (UTC+1) serialises
  //      as `…T23:00:00Z` and Postgres truncates to the *previous* day in a
  //      `@db.Date` column — that's how phantom Sunday occurrences leaked in
  //      (Apr 26 / May 3 etc.). The scheduling regenerator already does this;
  //      attendance paths must do it too.
  //   2) If the class has a `days` whitelist (Mon=1..Fri=5) and the requested
  //      date is not in it, refuse — second line of defence in case a UI loop
  //      ever asks for a Saturday/Sunday by mistake.
  async function ensureOccurrence(classId: number, date: Date) {
    const cls = await prisma.class.findUnique({ where: { id: classId }, select: { days: true } });
    const dayCodes: number[] = ((cls?.days as any) || []) as number[];
    if (dayCodes.length && !dayCodes.includes(date.getDay())) {
      throw new Error(`Class ${classId} doesn't run on ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()]} — refusing to create occurrence for ${date.toISOString().slice(0,10)}`);
    }
    const dateOnly = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const existing = await prisma.classOccurrence.findUnique({
      where: { classId_date: { classId, date: dateOnly } },
    });
    if (existing) return existing;
    return prisma.classOccurrence.create({ data: { classId, date: dateOnly } as any });
  }

  // ── Get attendance for a class for a full week ──
  async function getWeekAttendance(classId: number, weekOf: string) {
    // UTC math throughout: `weekOf` ("YYYY-MM-DD") parses to UTC midnight, so
    // local setDate/getDay/setHours shift the week back a day on a BST server
    // (issue #31 — sheet showed Sunday Jun14 instead of Monday Jun15). Use UTC.
    const monday = new Date(weekOf);
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    monday.setUTCHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setUTCDate(d.getUTCDate() + i);
      days.push(d);
    }

    const friday = days[4];

    // Get class info + students for this week
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classroom: true,
        studentAssignments: {
          where: {
            weekStart: { lte: friday },
            // Align EXACTLY with the Classes roster (scripts/classes.ts): a null
            // weekEnd only counts while the bookingCourse is still active.
            // Without the course-end check, "ghost" assignments (weekEnd null +
            // ended course) leak COMPLETED students onto the attendance sheet
            // even though the Classes view correctly hides them — issue #31's
            // "Attendance ≠ Classes" misalignment. Same clause = same roster.
            OR: [
              { weekEnd: { gte: monday } },
              { AND: [{ weekEnd: null }, { bookingCourse: { endDate: { gte: monday } } }] },
            ],
          },
          include: {
            student: { select: { id: true, firstName: true, lastName: true, currentLevel: true, nationality: true } },
            bookingCourse: {
              include: {
                booking: {
                  include: {
                    student: { select: { id: true, firstName: true, lastName: true, currentLevel: true, nationality: true } }
                  }
                }
              }
            }
          },
        },
        classTeachers: {
          where: {
            startDate: { lte: friday },
            OR: [{ endDate: null }, { endDate: { gte: monday } }],
          },
          include: { teacher: true },
        },
      },
    });

    if (!classData) return null;

    // Net teaching hours per day = (end − start − break)/60. Mirrors the financial
    // calculator in classes.ts so attendance hours match payroll/revenue exactly.
    // (Was hardcoded MORNING=3 / PM=3.25, which ignored the 15-min PM break — so PM
    // students were credited 3.25h instead of the real 3.0h. Issue #35. The private
    // 121 class also correctly resolves to its true 2.0h instead of 3.25.)
    const [_sh, _sm] = (classData.startTime || '00:00').split(':').map(Number);
    const [_eh, _em] = (classData.endTime || '00:00').split(':').map(Number);
    const _grossMin = (_eh * 60 + (_em || 0)) - (_sh * 60 + (_sm || 0));
    const blockHours = Math.max(0, (_grossMin - (classData.breakMinutes || 0)) / 60);

    // Ensure occurrences for all 5 days
    const occurrences: any[] = [];
    for (const d of days) {
      occurrences.push(await ensureOccurrence(classId, d));
    }

    // Get all attendance records for these occurrences
    const occIds = occurrences.map(o => o.id);
    const records = await prisma.attendance.findMany({
      where: { occurrenceId: { in: occIds } },
    });

    // Pull any student-recorded absence reasons covering the same week, so the
    // admin grid can show a small badge on absences that have a reason on file.
    const studentIdsInWeek = (classData.studentAssignments || [])
      .map(sa => sa.bookingCourse?.booking?.student?.id || (sa as any).student?.id)
      .filter(Boolean);
    const reasonRows = studentIdsInWeek.length
      ? await prisma.absenceReason.findMany({
          where: {
            studentId: { in: studentIdsInWeek },
            date: { in: days },
          },
          select: {
            studentId: true, date: true, reason: true, noteText: true,
            _count: { select: { certFiles: true } },
          },
        })
      : [];
    const reasonByKey = new Map(reasonRows.map(r => [
      `${r.studentId}|${r.date.toISOString().slice(0, 10)}`,
      { reason: r.reason, noteText: r.noteText, certCount: r._count.certFiles },
    ]));

    // Build student rows with daily attendance.
    // Student can come from two paths:
    //   1. bookingCourse → booking → student (when assignment is linked to a booking course)
    //   2. direct studentId on the assignment (manual assignments without a booking course)
    const students = (classData.studentAssignments || []).map(sa => {
      const student = sa.bookingCourse?.booking?.student || (sa as any).student;
      if (!student) return null;

      const dailyData = days.map((d, i) => {
        const occ = occurrences[i];
        const record = records.find(r => r.studentId === student.id && r.occurrenceId === occ.id);
        const iso = d.toISOString().split('T')[0];
        const rsn = reasonByKey.get(`${student.id}|${iso}`);
        return {
          date: iso,
          occurrenceId: occ.id,
          cancelled: occ.cancelled,
          status: record?.status || null,
          hours: record ? parseFloat(String((record as any).hours || blockHours)) : null,
          note: record?.note || null,
          studentReason: rsn?.reason || null,
          studentReasonNote: rsn?.noteText || null,
          studentReasonCertCount: rsn?.certCount || 0,
        };
      });

      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        nationality: student.nationality,
        level: student.currentLevel,
        days: dailyData,
      };
    }).filter(Boolean);

    return {
      classId,
      className: classData.name,
      classroom: classData.classroom?.name,
      session: classData.session,
      blockHours,
      teacher: classData.classTeachers?.[0]?.teacher || null,
      weekStart: monday.toISOString().split('T')[0],
      days: days.map(d => d.toISOString().split('T')[0]),
      cancellations: occurrences.map((o, i) => ({ date: days[i].toISOString().split('T')[0], cancelled: o.cancelled })),
      // Per-day confirmation footer: who last recorded this day + when. Only days
      // that have at least one recorded record with a recordedBy stamp show a
      // name — future days (no records) stay blank. Renders as "NM · 25 Sep".
      confirmations: occurrences.map((o, i) => {
        const dayRecs = records.filter(r => r.occurrenceId === o.id && (r as any).recordedBy);
        if (!dayRecs.length) return { date: days[i].toISOString().split('T')[0], by: null, at: null };
        const latest = dayRecs.reduce((a, b) => ((a as any).updatedAt > (b as any).updatedAt ? a : b));
        return {
          date: days[i].toISOString().split('T')[0],
          by: (latest as any).recordedBy || null,
          at: (latest as any).updatedAt ? (latest as any).updatedAt.toISOString() : null,
        };
      }),
      students,
    };
  }

  // ── Get attendance for a class on a specific date ──
  async function getClassAttendance(classId: number, date: string) {
    const d = new Date(date);
    const dayOfWeek = d.getUTCDay(); // 0=Sun, 1=Mon... (UTC — see issue #31)
    if (dayOfWeek === 0 || dayOfWeek === 6) return { students: [], attendance: [], date, dayOfWeek };

    // Get the Monday of this week for filtering assignments (UTC math — local
    // methods shift the week back a day on a BST server; issue #31).
    const monday = new Date(d);
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    monday.setUTCHours(0, 0, 0, 0);
    const friday = new Date(monday);
    friday.setUTCDate(friday.getUTCDate() + 4);

    // Get students assigned to this class for this week
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classroom: true,
        studentAssignments: {
          where: {
            weekStart: { lte: friday },
            // Same course-active guard as getWeekAttendance / the Classes roster:
            // a null weekEnd only counts while the bookingCourse is still active,
            // so completed students don't ghost onto the day view (issue #31).
            OR: [
              { weekEnd: { gte: monday } },
              { AND: [{ weekEnd: null }, { bookingCourse: { endDate: { gte: monday } } }] },
            ],
          },
          include: {
            bookingCourse: {
              include: {
                booking: {
                  include: {
                    student: {
                      select: { id: true, firstName: true, lastName: true, currentLevel: true, nationality: true }
                    }
                  }
                }
              }
            }
          },
        },
        classTeachers: {
          where: {
            startDate: { lte: d },
            OR: [
              { endDate: null },
              { endDate: { gte: d } },
            ],
          },
          include: { teacher: true },
        },
      },
    });

    if (!classData) return null;

    // Get or create occurrence
    const occurrence = await ensureOccurrence(classId, d);

    // Get existing attendance records
    const records = await prisma.attendance.findMany({
      where: { occurrenceId: occurrence.id },
    });

    // Build student list with attendance status
    const students = (classData.studentAssignments || []).map(sa => {
      const student = sa.bookingCourse?.booking?.student;
      if (!student) return null;
      const record = records.find(r => r.studentId === student.id);
      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        nationality: student.nationality,
        level: student.currentLevel,
        attendanceId: record?.id || null,
        status: record?.status || null,
        note: record?.note || null,
      };
    }).filter(Boolean);

    return {
      classId,
      className: classData.name,
      classroom: classData.classroom?.name,
      session: classData.session,
      date,
      occurrenceId: occurrence.id,
      cancelled: occurrence.cancelled,
      teacher: classData.classTeachers?.[0]?.teacher || null,
      students,
    };
  }

  // ── Mark attendance for a student ──
  async function markAttendance(data: {
    studentId: number;
    occurrenceId: number;
    status: string;
    hours?: number;
    note?: string;
    recordedBy?: string;
  }) {
    const existing = await prisma.attendance.findUnique({
      where: {
        studentId_occurrenceId: {
          studentId: data.studentId,
          occurrenceId: data.occurrenceId,
        },
      },
    });

    const payload: any = {
      status: data.status as any,
      hours: data.hours != null ? data.hours : null,
      note: data.note || null,
      recordedBy: data.recordedBy || null,
    };

    if (existing) {
      return prisma.attendance.update({ where: { id: existing.id }, data: payload });
    }

    return prisma.attendance.create({
      data: {
        studentId: data.studentId,
        occurrenceId: data.occurrenceId,
        ...payload,
      } as any,
    });
  }

  // ── Bulk mark attendance (all students at once) ──
  async function bulkMarkAttendance(records: Array<{
    studentId: number;
    occurrenceId: number;
    status: string;
    note?: string;
    recordedBy?: string | null;
  }>, recordedBy?: string | null) {
    const results = [];
    for (const r of records) {
      // Stamp WHO saved each row so a bulk save is always attributable (the
      // 21-25 Sep false-absent week had recordedBy=null — no way to trace it).
      results.push(await markAttendance({ ...r, recordedBy: (r.recordedBy ?? recordedBy) || undefined }));
    }
    return results;
  }

  // ── Cancel/uncancel a class occurrence ──
  async function toggleCancelled(classId: number, date: string) {
    const d = new Date(date);
    const occ = await ensureOccurrence(classId, d);
    return prisma.classOccurrence.update({
      where: { id: occ.id },
      data: { cancelled: !occ.cancelled },
    });
  }

  // ── Student attendance summary (for a booking/student) ──
  // Holiday-aware: rows whose occurrence.date falls inside any BookingHoliday
  // window are flagged onHoliday=true and excluded from the rate calculation.
  // The full record list is still returned (with onHoliday flag) so the UI
  // can display them with a 🏖️ badge.
  async function studentSummary(studentId: number) {
    const { fetchStudentHolidays, filterOutHolidayDates, legacyAttendanceCounts, courseTuitionRate, presentCredit } = await import('./attendance-pct');
    const records = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        occurrence: {
          include: {
            class_: { select: { name: true, session: true } },
          },
        },
      },
      orderBy: { occurrence: { date: 'desc' } },
    });

    const holidays = await fetchStudentHolidays(prisma, studentId);
    const ranges = holidays.map(h => {
      const s = new Date(h.startDate); s.setHours(0,0,0,0);
      const e = new Date(h.endDate); e.setHours(0,0,0,0);
      return [s.getTime(), e.getTime()] as const;
    });
    const onHolidayDate = (dateLike: Date | null) => {
      if (!dateLike) return false;
      const d = new Date(dateLike); d.setHours(0,0,0,0);
      const t = d.getTime();
      return ranges.some(([s, e]) => t >= s && t <= e);
    };

    // Absence reasons + cert-file counts, keyed by ISO date, so the staff
    // drill-down can show why a day was missed and link to any sick note.
    const reasonRows = await prisma.absenceReason.findMany({
      where: { studentId },
      select: { date: true, reason: true, noteText: true, _count: { select: { certFiles: true } } },
    });
    const reasonByDate = new Map(reasonRows.map(r => [
      r.date.toISOString().slice(0, 10),
      { reason: r.reason, noteText: r.noteText, certCount: r._count.certFiles },
    ]));

    const flagged = records.map(r => {
      const iso = r.occurrence?.date ? new Date(r.occurrence.date).toISOString().slice(0, 10) : null;
      const rsn = iso ? reasonByDate.get(iso) : null;
      return {
        ...r,
        onHoliday: onHolidayDate(r.occurrence?.date || null),
        reason: rsn?.reason || null,
        reasonNote: rsn?.noteText || null,
        certCount: rsn?.certCount || 0,
      };
    });
    const counted = filterOutHolidayDates(records, holidays);

    const total = counted.length;
    const present = presentCredit(counted, studentId);   // LATE = 0.5 (retroactive; #913 grandfathered)
    const absent = counted.filter(r => r.status === 'ABSENT_UNCERTIFIED').length;
    const absentCertified = counted.filter(r => r.status === 'ABSENT_CERTIFIED').length;
    const excused = counted.filter(r => r.status === 'EXCUSED').length;
    const onHolidayCount = records.length - counted.length;

    // Fold in the pre-migration Fidelo figure carried on the student's
    // legacy-stamped booking (weighted with the SIS days), so the headline rate
    // matches what the student sees in the app. SIS-only when there's no legacy.
    const legBooking = await prisma.booking.findFirst({
      where: { studentId, legacyAttendancePct: { not: null } },
      select: { legacyAttendancePct: true, serviceStart: true },
    });
    const leg = legacyAttendanceCounts(
      legBooking?.legacyAttendancePct != null ? Number(legBooking.legacyAttendancePct) : null,
      legBooking?.serviceStart || null,
    );
    const combTotal = total + leg.total;
    const rate = combTotal > 0 ? Math.round(((present + leg.present) / combTotal) * 100) : 0;

    // ── Per-booking breakdown ──────────────────────────────────────────────
    // ILEP/non-EU renewal is measured PER booking (course window) and must
    // NEVER be averaged across bookings — Booking#2 must independently hit 85%.
    // So we compute a SIS-recorded rate scoped to each booking's course span
    // (holiday days already excluded via `counted`). The lifetime `rate` above
    // is the informational blended figure; `perBooking`/`current` are the
    // compliance figures. Legacy blend is intentionally NOT applied per-booking
    // (it's a pre-migration cumulative, not a course-window measurement).
    const bookingsForWin = await prisma.booking.findMany({
      where: { studentId, status: { not: 'CANCELLED' } },
      select: { id: true, serviceStart: true, serviceEnd: true,
        courses: { select: { name: true, startDate: true, endDate: true, holidayWks: true } } },
    });
    const toWindow = (b: typeof bookingsForWin[number]) => {
      const starts = b.courses.map(c => c.startDate).filter(Boolean).map(d => +new Date(d!));
      const ends = b.courses.map(c => c.endDate).filter(Boolean).map(d => +new Date(d!));
      const start = starts.length ? new Date(Math.min(...starts)) : (b.serviceStart || null);
      const end = ends.length ? new Date(Math.max(...ends)) : (b.serviceEnd || null);
      return { start, end };
    };
    const rateInWindow = (start: Date | null, end: Date | null) => {
      if (!start || !end) return { total: 0, present: 0, absent: 0, absentCertified: 0, excused: 0, rate: null as number | null };
      const s = new Date(start); s.setHours(0, 0, 0, 0);
      const e = new Date(end); e.setHours(23, 59, 59, 999);
      const win = counted.filter(r => {
        const d = r.occurrence?.date ? +new Date(r.occurrence.date) : null;
        return d != null && d >= +s && d <= +e;
      });
      const t = win.length;
      const p = presentCredit(win, studentId);   // LATE = 0.5 (retroactive; #913 grandfathered)
      return {
        total: t, present: p,
        absent: win.filter(r => r.status === 'ABSENT_UNCERTIFIED').length,
        absentCertified: win.filter(r => r.status === 'ABSENT_CERTIFIED').length,
        excused: win.filter(r => r.status === 'EXCUSED').length,
        rate: t > 0 ? Math.round((p / t) * 100) : null,
      };
    };
    const perBooking = bookingsForWin.map(b => {
      const w = toWindow(b);
      const label = [...new Set(b.courses.map(c => c.name).filter(Boolean))].join(', ');
      return {
        bookingId: b.id, label,
        start: w.start ? w.start.toISOString().slice(0, 10) : null,
        end: w.end ? w.end.toISOString().slice(0, 10) : null,
        ...rateInWindow(w.start, w.end),
      };
    });
    // ── Per-COURSE breakdown (Academic Year / LifePass) ────────────────────
    // A LifePass booking nests 3 sequential AY courses in one booking window, so
    // the per-booking rate above blends all three. Compliance (ILEP 85%) is
    // measured PER COURSE with its own 25-tuition-week cap — mirror the admin
    // badge's `_courseAtt` via the shared server helper. Only AY courses (those
    // carrying a `holidayWks` entitlement) produce a per-course row; a plain
    // single-course booking's course row equals its per-booking figure.
    const perCourse = bookingsForWin.flatMap(b =>
      b.courses
        .filter(c => c.holidayWks != null && c.startDate)
        .map(c => {
          const startIso = c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : null;
          const endIso = c.endDate ? new Date(c.endDate).toISOString().slice(0, 10) : null;
          const r = courseTuitionRate(records, startIso, endIso, c.holidayWks, onHolidayDate, studentId);
          return { bookingId: b.id, label: c.name || 'Course', start: startIso, end: endIso, holidayWks: c.holidayWks, ...r };
        }),
    );

    // Current = the booking window containing today; else the latest-ending one.
    // When the student is on AY courses, the compliance headline should track the
    // CURRENT course (its 25-week tuition window), not the blended booking span —
    // so prefer the per-course row containing today, then the latest-ending one.
    const nowMs = Date.now();
    let current: any = perBooking.find(pb => pb.start && pb.end && +new Date(pb.start) <= nowMs && nowMs <= +new Date(pb.end) + 24 * 60 * 60 * 1000) || null;
    if (!current) current = perBooking.filter(pb => pb.end).sort((a, b) => +new Date(b.end!) - +new Date(a.end!))[0] || null;
    if (perCourse.length) {
      // Prefer the course running today; else — e.g. in a summer gap between two
      // nested AY courses — the most-recent course that has already STARTED (so
      // we headline the just-finished course's rate, not an empty future one);
      // else the latest-ending course as a last resort.
      const curCourse = perCourse.find(pc => pc.start && pc.end && +new Date(pc.start) <= nowMs && nowMs <= +new Date(pc.end) + 24 * 60 * 60 * 1000)
        || perCourse.filter(pc => pc.start && +new Date(pc.start) <= nowMs).sort((a, b) => +new Date(b.start!) - +new Date(a.start!))[0]
        || perCourse.filter(pc => pc.end).sort((a, b) => +new Date(b.end!) - +new Date(a.end!))[0] || null;
      if (curCourse) current = curCourse;
    }

    return { total, present, absent, absentCertified, excused, onHoliday: onHolidayCount, rate, legacy: leg.total > 0 ? { pct: Number(legBooking!.legacyAttendancePct), estDays: leg.total } : null, perBooking, perCourse, current, records: flagged };
  }

  // ── Monitoring dashboard ────────────────────────────────────────────────
  // One row per in-school Academic-Year / ILEP student with their attendance %
  // to date. The % + counts come straight from studentSummary() — the SAME
  // tally used everywhere else. We NEVER recompute the blend here: this is a
  // reader onto the one tally, not a second window onto it. The date range is
  // used ONLY to surface who was absent in it (the weekly co-pilot signal); it
  // does not change the headline %.
  async function monitor(opts?: { classId?: number | null; from?: string | null; to?: string | null }) {
    // Everyone currently placed in a class (the real gate, enforced below). Each
    // is flagged is_ay = does their active course make them Academic Year / ILEP
    // (name = Academic Year / Academic Year Renewal / LifePass, or holiday_wks
    // set). The AY pill keys off this — only AY students are subject to the ILEP
    // 85% rule / warnings; short-stay & general-course students are not.
    const cohort: any[] = await prisma.$queryRawUnsafe(
      `SELECT s.id, s.first_name, s.last_name,
              COALESCE(s.placement_test_level, s.current_level) AS level,
              BOOL_OR(bc.holiday_wks IS NOT NULL OR bc.name ~* 'academic year|renewal|life ?pass') AS is_ay
         FROM students s
         JOIN bookings b ON b.student_id = s.id
              -- Class placement is the gate: a placed, attending student can sit
              -- on a PARTIAL booking (staff allow a small balance for placement),
              -- so we only drop ESCROW / CANCELLED here.
              AND (b.status IS NULL OR b.status NOT IN ('ESCROW','CANCELLED')) AND b.amount_total > 0
         JOIN booking_courses bc ON bc.booking_id = b.id AND bc.active = true
              AND CURRENT_DATE BETWEEN bc.start_date AND bc.end_date
        GROUP BY s.id, s.first_name, s.last_name, level
        ORDER BY s.first_name`);
    const ids = cohort.map(c => Number(c.id));
    if (!ids.length) return { students: [], classes: [] };

    // Current class per student (latest assignment covering today).
    const today = new Date();
    const asgs = await prisma.studentClassAssignment.findMany({
      where: {
        studentId: { in: ids },
        weekStart: { lte: today },
        OR: [{ weekEnd: null }, { weekEnd: { gte: today } }],
      },
      select: { studentId: true, classId: true, weekStart: true, class_: { select: { name: true, session: true } } },
      orderBy: { weekStart: 'desc' },
    });
    const clsBy = new Map<number, { classId: number; label: string }>();
    for (const a of asgs) {
      if (a.studentId == null || clsBy.has(a.studentId) || !a.class_) continue;
      // The class name already carries its session (e.g. "A2 AM", "B2&C1 PM").
      clsBy.set(a.studentId, { classId: a.classId, label: a.class_.name });
    }

    // Recent-absence surface (NOT a tally): ABSENT_UNCERTIFIED count in [from,to].
    const absInRange = new Map<number, number>();
    if (opts?.from && opts?.to) {
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT a.student_id AS sid, COUNT(*)::int AS n
           FROM attendance a JOIN class_occurrences o ON o.id = a.occurrence_id
          WHERE a.student_id = ANY($1::int[]) AND a.status = 'ABSENT_UNCERTIFIED'
            AND o.date BETWEEN $2::date AND $3::date
          GROUP BY a.student_id`, ids, opts.from, opts.to);
      for (const r of rows) absInRange.set(Number(r.sid), Number(r.n));
    }

    const students: any[] = [];
    for (const c of cohort) {
      const sid = Number(c.id);
      const cls = clsBy.get(sid);
      if (!cls) continue;   // only students currently placed in a class belong here
      if (opts?.classId && cls.classId !== opts.classId) continue;
      let pct: number | null = null, present = 0, total = 0, absent = 0;
      try {
        const sum: any = await studentSummary(sid);   // ← the single source of truth
        present = Number(sum?.present ?? 0);
        total = Number(sum?.total ?? 0);
        absent = Math.max(0, Math.round((total - present) * 10) / 10);
        // No recorded days → "no data" (null), not 0% — so newly-arrived / un-
        // entered students sink to the bottom instead of falsely topping the list.
        pct = total > 0 ? (sum?.rate ?? null) : null;
      } catch { /* leave nulls — a bad row shouldn't sink the dashboard */ }
      students.push({
        studentId: sid,
        name: `${c.first_name} ${c.last_name || ''}`.trim(),
        level: c.level || null,
        classId: cls?.classId ?? null,
        className: cls?.label || null,
        isAY: !!c.is_ay,
        pct, daysCounted: total, absences: absent,
        absentInRange: absInRange.get(sid) || 0,
      });
    }
    // Worst attendance first (nulls to the bottom).
    students.sort((a, b) => (a.pct ?? 999) - (b.pct ?? 999));

    // Distinct class list for the filter dropdown (from the cohort's assignments).
    const classes = [...new Map(students.filter(s => s.classId != null)
      .map(s => [s.classId as number, { id: s.classId as number, name: s.className as string }])).values()]
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return { students, classes };
  }

  // Send the general attendance warning to hand-picked students (co-piloted —
  // a human chooses who and clicks send). Reuses the 'Attendance-Absence' DB
  // template and the same sendStudentEmail + in-app path as the daily cron.
  // Deliberately no exact percentages in the copy.
  async function sendWarnings(studentIds: number[], sentBy?: string | null) {
    const { sendStudentEmail } = await import('../routes/email');
    const { messageScripts } = await import('./messages');
    const FROM_EMAIL = 'success@ulearnschool.com';
    const FROM_NAME = 'ULearn Team';
    const FALLBACK_SUBJECT = 'ULearn — Attendance Notice';
    const tpl = await prisma.documentTemplate.findFirst({
      where: emailTemplateWhere('Attendance-Absence', { templateType: 'email' }),
      select: { id: true, subject: true, htmlTemplate: true },
    });
    if (!tpl?.htmlTemplate) return { sent: 0, results: [], error: "'Attendance-Absence' template missing" };
    const render = (s: string, first: string) =>
      (s || '').replace(/\{\{\s*student\.first_name\s*\}\}/g, first || 'there')
               .replace(/\{\{\s*first_name\s*\}\}/g, first || 'there');
    const results: any[] = [];
    for (const id of studentIds) {
      const s = await prisma.student.findUnique({ where: { id }, select: { id: true, firstName: true, email: true } });
      if (!s?.email) { results.push({ id, ok: false, error: 'no email' }); continue; }
      const subject = render(tpl.subject || FALLBACK_SUBJECT, s.firstName || '');
      const html = render(tpl.htmlTemplate!, s.firstName || '');
      try {
        const res: any = await sendStudentEmail(prisma, {
          from: FROM_EMAIL, fromName: FROM_NAME, to: s.email,
          subject, html, studentId: s.id, templateId: tpl.id,
        });
        try {
          await messageScripts(prisma).postToApp({
            studentId: s.id, subject, bodyHtml: html,
            sentBy: sentBy || FROM_EMAIL, emailLogId: res?.emailLogId ?? null,
          });
        } catch { /* in-app mirror is best-effort */ }
        results.push({ id, ok: true });
      } catch (e: any) {
        results.push({ id, ok: false, error: e?.message || String(e) });
      }
    }
    return { sent: results.filter(r => r.ok).length, results };
  }

  return {
    getWeekAttendance, getClassAttendance, markAttendance, bulkMarkAttendance,
    toggleCancelled, studentSummary, monitor, sendWarnings,
  };
}
