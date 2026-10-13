import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { PrismaClient } from '../generated/prisma/client';
import { studentScripts } from '../scripts/students';
import { studentScripts as portalScripts } from '../scripts/student';
import { challengerNudgeScripts } from '../scripts/challenger-nudge';
import { compressUploads } from '../lib/compress';
import { syncArrivalFromFlight } from '../lib/transport-sync';
import { parsePassport, fillBirthdayIfEmpty } from '../scripts/passport-parser';

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'students');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(uploadDir, String(_req.params.id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')),
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const ok = /^(image\/|application\/pdf|application\/msword|application\/vnd\.openxmlformats)/.test(file.mimetype);
    cb(null, ok || true); // allow all — the filter is advisory
  },
});

export function studentRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = studentScripts(prisma);
  const portal = portalScripts(prisma);
  const nudge = challengerNudgeScripts(prisma);

  router.get('/', async (req, res) => {
    try {
      const result = await scripts.list(req.query);
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // GET /students/arrivals?from=YYYY-MM-DD&to=YYYY-MM-DD
  //
  // The student-centric "new arrivals" view Antonella shares with Paul each
  // Friday. A row is an arrival iff the student's EARLIEST booking_course
  // start_date (across all their bookings) falls inside [from, to] — i.e.
  // their first time ever at ULearn lands in the window. Returning
  // students extending into another course don't qualify.
  //
  // Defaults to next Mon–Sun if no params given.
  router.get('/arrivals', async (req, res) => {
    try {
      let from = req.query.from ? new Date(String(req.query.from)) : null;
      let to = req.query.to ? new Date(String(req.query.to)) : null;
      if (!from || !to) {
        // Next Mon → next Sun
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const day = today.getDay();
        const daysUntilMon = day === 0 ? 1 : (8 - day);
        from = new Date(today); from.setDate(from.getDate() + daysUntilMon);
        to = new Date(from); to.setDate(to.getDate() + 6);
      }
      const fromIso = from.toISOString().slice(0, 10);
      const toIso = to.toISOString().slice(0, 10);

      // Two-step: find the FIRST course start per student, then keep only
      // students whose first-start sits in the window. Single CTE keeps it
      // a single round-trip. Excludes CANCELLED bookings so a phantom early
      // booking that was later cancelled doesn't mask a real first-arrival.
      const rows = await prisma.$queryRaw<Array<any>>`
        WITH win_bc AS (
          -- Per student, the earliest ACTIVE course whose start falls in the
          -- window. Filtering to the window BEFORE the DISTINCT ON is what lets
          -- returning / renewal students surface: a stale still-active old
          -- course (a Fidelo import that was never deactivated) has an earlier
          -- start, so it used to win the DISTINCT ON, look like a past arrival,
          -- and drop the student out of the window entirely. (#45)
          SELECT DISTINCT ON (b.student_id)
                 b.student_id,
                 bc.id            AS bc_id,
                 bc.booking_id    AS booking_id,
                 bc.name          AS course_name,
                 bc.start_date    AS course_start,
                 bc.end_date      AS course_end,
                 bc.weeks         AS course_weeks,
                 bc.category      AS course_category,
                 bc.is_renewal    AS is_renewal,
                 bc.ilep_code     AS ilep_code
          FROM bookings b
          JOIN booking_courses bc ON bc.booking_id = b.id
          WHERE b.status != 'CANCELLED'
            AND bc.active = true
            AND bc.start_date BETWEEN ${fromIso}::date AND ${toIso}::date
          ORDER BY b.student_id, bc.start_date ASC, bc.id ASC
        ),
        with_totals AS (
          SELECT wb.*,
                 ( SELECT COALESCE(SUM(bc2.weeks), 0)::int
                   FROM booking_courses bc2
                   WHERE bc2.booking_id = wb.booking_id ) AS booking_total_weeks,
                 -- New / Continuing / Renewal (#45). First ULearn course → new
                 -- (even an Academic Year — a first-timer isn't renewing a visa).
                 -- Otherwise an academic-year / ILEP course → renewal (visa-
                 -- relevant, warrants a proper look); any shorter re-up that
                 -- isn't visa-length → continuing.
                 CASE
                   WHEN NOT EXISTS (
                     SELECT 1 FROM bookings pb
                     JOIN booking_courses pbc ON pbc.booking_id = pb.id
                     WHERE pb.student_id = wb.student_id
                       AND pb.status != 'CANCELLED'
                       AND pbc.start_date < wb.course_start
                   ) THEN 'new'
                   WHEN wb.ilep_code IS NOT NULL OR wb.is_renewal
                     OR wb.course_name ILIKE '%renewal%'
                     OR wb.course_name ILIKE '%academic year%'
                     OR wb.course_name ILIKE '%life pass%'
                     THEN 'renewal'
                   ELSE 'continuing'
                 END AS enrol_type
          FROM win_bc wb
        )
        SELECT s.id                AS student_id,
               s.first_name, s.last_name, s.email, s.nationality, s.birthday, s.gender,
               s.current_level, s.placement_test_level, s.placement_test_score, s.quiz_score, s.student_status,
               s.profile_picture, s.instagram_handle, s.card_on_file,
               EXISTS (SELECT 1 FROM device_tokens dt WHERE dt.student_id = s.id) AS has_app_logon,
               EXISTS (SELECT 1 FROM sis_users su WHERE lower(su.email) = lower(s.email) AND su.user_type = 'student' AND su.active) AS has_account,
               wt.bc_id, wt.booking_id, wt.course_name, wt.course_start, wt.course_end,
               wt.course_weeks, wt.course_category, wt.booking_total_weeks, wt.enrol_type,
               b.status AS booking_status, b.group_id,
               ag.name AS agency_name,
               (
                 SELECT json_build_object(
                   'type',  ba.accommodation_type,
                   'room',  ba.room_type,
                   'board', ba.board,
                   'start', ba.start_date,
                   'end',   ba.end_date
                 )
                 FROM booking_accommodations ba
                 WHERE ba.booking_id = wt.booking_id AND ba.active = true
                 ORDER BY ba.start_date ASC
                 LIMIT 1
               ) AS accommodation
        FROM with_totals wt
        JOIN students s   ON s.id = wt.student_id
        JOIN bookings b   ON b.id = wt.booking_id
        LEFT JOIN agencies ag ON ag.id = b.agency_id
        ORDER BY wt.course_start ASC, s.last_name, s.first_name
      `;

      // Attach any 1-to-1 (PRIVATE) component on each row's booking. The query
      // above keeps only the earliest-starting course, so a mixed booking's 121
      // (which needs a specially-rostered teacher) would otherwise be invisible
      // in Arrivals — Paul Gill's report, 2026-08-31. Looked up independent of the
      // arrivals window so a 121 with different dates is still surfaced.
      const bookingIds = [...new Set(rows.map((r: any) => r.booking_id).filter(Boolean))] as number[];
      if (bookingIds.length) {
        const privs = await prisma.bookingCourse.findMany({
          where: { bookingId: { in: bookingIds }, category: 'PRIVATE', active: true },
          select: { bookingId: true, name: true, startDate: true, endDate: true, hoursPerWeek: true, weeks: true },
          orderBy: { startDate: 'asc' },
        });
        const byBooking = new Map<number, any>();
        for (const p of privs) if (!byBooking.has(p.bookingId)) byBooking.set(p.bookingId, p);
        for (const r of rows as any[]) {
          const p = byBooking.get(r.booking_id);
          r.private121 = p ? {
            name: p.name,
            start: p.startDate ? p.startDate.toISOString().slice(0, 10) : null,
            end: p.endDate ? p.endDate.toISOString().slice(0, 10) : null,
            hours_per_week: p.hoursPerWeek != null ? Number(p.hoursPerWeek) : null,
            weeks: p.weeks,
          } : null;
        }
      }

      // LOA monitor — flag Academic-Year / LifePass bookings that are fully
      // funded (standard payment OR escrow-held) but have NO issued LOA, so
      // reception can see at a glance who's still waiting on their visa letter.
      // Same shape as the card-on-file badge; read-only, no automation here.
      if (bookingIds.length) {
        const loaTpl = await prisma.documentTemplate.findFirst({
          where: { slug: 'LOA-NonEU-QR', templateType: 'document' }, select: { id: true },
        });
        const issuedSet = new Set<number>();
        if (loaTpl) {
          const issued = await prisma.documentRecord.findMany({
            where: { bookingId: { in: bookingIds }, templateId: loaTpl.id, status: 'ISSUED' },
            select: { bookingId: true },
          });
          for (const d of issued) if (d.bookingId != null) issuedSet.add(d.bookingId);
        }
        const fins = await prisma.booking.findMany({
          where: { id: { in: bookingIds } },
          select: { id: true, status: true, amountTotal: true, amountPaid: true, payments: { select: { amount: true, type: true, method: true } } },
        });
        const fundedSet = new Set<number>();
        for (const f of fins) {
          const total = Number(f.amountTotal || 0);
          const escrow = f.payments.filter(p => p.type === 'Escrow' || /escrow/i.test(p.method || '')).reduce((s, p) => s + Number(p.amount || 0), 0);
          if (total > 0 && (Number(f.amountPaid || 0) >= total - 0.01 || escrow >= total - 1.00 || f.status === 'ESCROW')) fundedSet.add(f.id);
        }
        for (const r of rows as any[]) {
          // AY/LifePass is the filter (course-driven — AY implies non-EU visa).
          const isAY = /academic year|life ?pass|renewal/i.test(r.course_name || '') || r.is_renewal || r.ilep_code != null;
          r.loa_issued = issuedSet.has(r.booking_id);
          r.loa_missing = isAY && fundedSet.has(r.booking_id) && !r.loa_issued;
          r.loa_relevant = isAY;
        }
      }

      res.json({
        from: fromIso, to: toIso,
        count: rows.length,
        arrivals: rows,
      });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // GET /students/departures?from=YYYY-MM-DD&to=YYYY-MM-DD
  //
  // Mirror of /arrivals on the other end: a row is a departure iff the
  // student's LATEST booking_course end_date falls inside [from, to] — i.e.
  // their final course at ULearn finishes in the window. Continuing
  // students with another course still ahead don't qualify.
  router.get('/departures', async (req, res) => {
    try {
      let from = req.query.from ? new Date(String(req.query.from)) : null;
      let to = req.query.to ? new Date(String(req.query.to)) : null;
      if (!from || !to) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const day = today.getDay();
        const daysUntilMon = day === 0 ? 1 : (8 - day);
        from = new Date(today); from.setDate(from.getDate() + daysUntilMon);
        to = new Date(from); to.setDate(to.getDate() + 6);
      }
      const fromIso = from.toISOString().slice(0, 10);
      const toIso = to.toISOString().slice(0, 10);

      const rows = await prisma.$queryRaw<Array<any>>`
        WITH last_bc AS (
          SELECT DISTINCT ON (b.student_id)
                 b.student_id,
                 bc.id            AS bc_id,
                 bc.booking_id    AS booking_id,
                 bc.name          AS course_name,
                 bc.start_date    AS course_start,
                 bc.end_date      AS course_end,
                 bc.weeks         AS course_weeks,
                 bc.category      AS course_category
          FROM bookings b
          JOIN booking_courses bc ON bc.booking_id = b.id
          WHERE b.status != 'CANCELLED'
            AND bc.active = true
          ORDER BY b.student_id, bc.end_date DESC, bc.id DESC
        ),
        with_totals AS (
          SELECT lb.*,
                 ( SELECT COALESCE(SUM(bc2.weeks), 0)::int
                   FROM booking_courses bc2
                   WHERE bc2.booking_id = lb.booking_id ) AS booking_total_weeks
          FROM last_bc lb
          WHERE lb.course_end BETWEEN ${fromIso}::date AND ${toIso}::date
        )
        SELECT s.id                AS student_id,
               s.first_name, s.last_name, s.email, s.nationality, s.birthday, s.gender,
               s.current_level, s.placement_test_level, s.placement_test_score, s.quiz_score, s.student_status,
               s.profile_picture, s.instagram_handle, s.card_on_file,
               EXISTS (SELECT 1 FROM device_tokens dt WHERE dt.student_id = s.id) AS has_app_logon,
               EXISTS (SELECT 1 FROM sis_users su WHERE lower(su.email) = lower(s.email) AND su.user_type = 'student' AND su.active) AS has_account,
               wt.bc_id, wt.booking_id, wt.course_name, wt.course_start, wt.course_end,
               wt.course_weeks, wt.course_category, wt.booking_total_weeks,
               b.status AS booking_status, b.group_id,
               ag.name AS agency_name,
               (
                 SELECT json_build_object(
                   'type',  ba.accommodation_type,
                   'room',  ba.room_type,
                   'board', ba.board,
                   'start', ba.start_date,
                   'end',   ba.end_date
                 )
                 FROM booking_accommodations ba
                 WHERE ba.booking_id = wt.booking_id AND ba.active = true
                 ORDER BY ba.end_date DESC
                 LIMIT 1
               ) AS accommodation
        FROM with_totals wt
        JOIN students s   ON s.id = wt.student_id
        JOIN bookings b   ON b.id = wt.booking_id
        LEFT JOIN agencies ag ON ag.id = b.agency_id
        ORDER BY wt.course_end ASC, s.last_name, s.first_name
      `;

      res.json({
        from: fromIso, to: toIso,
        count: rows.length,
        departures: rows,
      });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // GET /students/birthdays — UPCOMING birthdays of students currently in school
  // (a non-cancelled, active booking course spanning today) who have a DOB.
  // Next-occurrence + days-until + age-they-turn computed in JS (avoids SQL
  // Feb-29 edge cases). Sorted soonest-first. Past birthdays aren't tracked.
  router.get('/birthdays', async (req, res) => {
    try {
      const rows = await prisma.$queryRaw<Array<any>>`
        SELECT DISTINCT ON (s.id)
               s.id AS student_id, s.first_name, s.last_name, s.email, s.nationality,
               s.birthday, s.profile_picture, s.current_level, s.gender,
               bc.end_date AS course_end
        FROM students s
        -- Canonical "currently in school" cohort (mirrors studentsInSchool): a real,
        -- non-escrow, non-cancelled, non-€0-ghost booking spanning today. Excludes
        -- escrow / visa-pending (paid but never arrived) and refund/never-showed cases.
        JOIN bookings b         ON b.student_id = s.id AND b.status NOT IN ('ESCROW','CANCELLED') AND b.amount_total > 0
        JOIN booking_courses bc ON bc.booking_id = b.id AND bc.active = true
        WHERE s.birthday IS NOT NULL
          AND CURRENT_DATE BETWEEN bc.start_date AND bc.end_date
        ORDER BY s.id, bc.end_date DESC
      `;
      const now = new Date();
      const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      const out = rows.map((r) => {
        const dob = new Date(r.birthday);
        const m = dob.getUTCMonth(), d = dob.getUTCDate(), by = dob.getUTCFullYear();
        const yr = new Date(todayUTC).getUTCFullYear();
        let next = Date.UTC(yr, m, d);
        if (next < todayUTC) next = Date.UTC(yr + 1, m, d);
        const daysUntil = Math.round((next - todayUTC) / 86400000);
        const turningAge = new Date(next).getUTCFullYear() - by;
        return {
          ...r,
          next_birthday: new Date(next).toISOString().slice(0, 10),
          days_until: daysUntil,
          turning_age: turningAge,     // age on their next birthday
          age: turningAge - (daysUntil === 0 ? 0 : 1),  // age today
        };
      }).sort((a, b) => a.days_until - b.days_until || a.last_name?.localeCompare(b.last_name));
      res.json({ count: out.length, birthdays: out });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // GET /students/feedback-report?from=YYYY-MM-DD&to=YYYY-MM-DD
  //
  // Aggregate of student-submitted star ratings, grouped by the thing being
  // rated: accommodation provider (hosts + apartments) and social activity.
  // SIS-only data — does NOT include LMS lesson feedback (Paul wants the
  // teacher-facing aggregate to stay in the LMS). Window filter is on the
  // feedback createdAt, defaulting to the last 90 days.
  router.get('/feedback-report', async (req, res) => {
    try {
      // Server defaults: align with local server time so "today" matches the
      // user's "today" (vs toISOString() which shifts by the UTC offset).
      const localYmd = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const defFrom = new Date(today); defFrom.setDate(defFrom.getDate() - 90);
      const fromIso = req.query.from ? String(req.query.from) : localYmd(defFrom);
      const toIso   = req.query.to   ? String(req.query.to)   : localYmd(today);

      // Accommodation: aggregate per provider (host/apartment), only rated
      // rows (stars not null). Comments collected as a JSON array so the UI
      // can render the last few. The `kind` is preserved so we can split
      // first-week vs final wrap-up sentiment if Paul wants that later.
      const accomm = await prisma.$queryRaw<Array<any>>`
        SELECT p.id                                AS provider_id,
               p.name                              AS provider_name,
               p.type                              AS provider_type,
               COUNT(af.stars)::int                AS ratings,
               ROUND(AVG(af.stars)::numeric, 1)    AS avg_stars,
               COUNT(NULLIF(af.comment, ''))::int  AS comments,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'stars',     af.stars,
                     'comment',   af.comment,
                     'kind',      af.kind,
                     'createdAt', af.created_at,
                     'studentId', af.student_id,
                     'studentName', s.first_name || ' ' || s.last_name
                   )
                   ORDER BY af.created_at DESC
                 ) FILTER (WHERE af.comment IS NOT NULL AND af.comment <> ''),
                 '[]'::json
               )                                  AS recent_comments
        FROM accommodation_feedback af
        JOIN booking_accommodations ba ON ba.id = af.booking_accommodation_id
        JOIN accommodation_beds      bd ON bd.id = ba.bed_id
        JOIN accommodation_rooms     rm ON rm.id = bd.room_id
        JOIN accommodation_properties pr ON pr.id = rm.property_id
        JOIN accommodation_providers p  ON p.id = pr.provider_id
        JOIN students                s  ON s.id = af.student_id
        WHERE af.stars IS NOT NULL
          AND af.created_at::date BETWEEN ${fromIso}::date AND ${toIso}::date
        GROUP BY p.id, p.name, p.type
        ORDER BY avg_stars ASC NULLS LAST, ratings DESC
      `;

      // Social: aggregate per activity. Activities are dated, so we surface
      // the activity date alongside title — repeat-title activities (e.g.
      // weekly Pub Quiz) stay as separate rows so each instance's rating
      // story is preserved.
      const social = await prisma.$queryRaw<Array<any>>`
        SELECT a.id                                AS activity_id,
               a.title                             AS activity_title,
               a.date                              AS activity_date,
               a.location                          AS activity_location,
               COUNT(sf.stars)::int                AS ratings,
               ROUND(AVG(sf.stars)::numeric, 1)    AS avg_stars,
               COUNT(NULLIF(sf.comment, ''))::int  AS comments,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'stars',     sf.stars,
                     'comment',   sf.comment,
                     'createdAt', sf.created_at,
                     'studentId', sf.student_id,
                     'studentName', s.first_name || ' ' || s.last_name
                   )
                   ORDER BY sf.created_at DESC
                 ) FILTER (WHERE sf.comment IS NOT NULL AND sf.comment <> ''),
                 '[]'::json
               )                                  AS recent_comments
        FROM social_activity_feedback sf
        JOIN activities a ON a.id = sf.activity_id
        JOIN students   s ON s.id = sf.student_id
        WHERE sf.stars IS NOT NULL
          AND sf.created_at::date BETWEEN ${fromIso}::date AND ${toIso}::date
        GROUP BY a.id, a.title, a.date, a.location
        ORDER BY a.date DESC, avg_stars ASC NULLS LAST
      `;

      // Overall totals for the header bar — separate to keep the per-row
      // queries unfiltered by anything but stars/window.
      const totals = await prisma.$queryRaw<Array<any>>`
        SELECT 'accomm' AS kind,
               COUNT(stars)::int             AS ratings,
               ROUND(AVG(stars)::numeric, 1) AS avg_stars
        FROM accommodation_feedback
        WHERE stars IS NOT NULL
          AND created_at::date BETWEEN ${fromIso}::date AND ${toIso}::date
        UNION ALL
        SELECT 'social' AS kind,
               COUNT(stars)::int             AS ratings,
               ROUND(AVG(stars)::numeric, 1) AS avg_stars
        FROM social_activity_feedback
        WHERE stars IS NOT NULL
          AND created_at::date BETWEEN ${fromIso}::date AND ${toIso}::date
      `;

      res.json({
        from: fromIso, to: toIso,
        totals,
        accomm,
        social,
      });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // GET /students/nationality-mix?from=YYYY-MM-DD&to=YYYY-MM-DD
  //
  // Nationality breakdown of every student who was IN SCHOOL during the
  // window — i.e. had a course whose dates overlap [from, to]. "In school
  // in April" = any course active at any point in April, so the overlap
  // test is course.start <= to AND course.end >= from (bookends both the
  // start and end dates as Neil described). Cancelled bookings excluded.
  // No params → current calendar month ("students currently in school").
  // GET /students/qqi-learner-weeks?year=2024 — QQI/IEMAS learner-week report
  // (programme + nationality tables, cleaned/enrolled basis). Defaults to 2024.
  router.get('/qqi-learner-weeks', async (req, res) => {
    try {
      const year = parseInt(String(req.query.year || '2024')) || 2024;
      res.json(await scripts.qqiLearnerWeeks(year));
    } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }); }
  });

  // GET /students/in-school?from=YYYY-MM-DD&to=YYYY-MM-DD
  // Diagnostic report: every student in school during the window, joined to
  // their current class assignment (if any), booking status + payment state.
  router.get('/in-school', async (req, res) => {
    try {
      const localYmd = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      // Default range = current Mon–Sun.
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
      const fromIso = req.query.from ? String(req.query.from) : localYmd(monday);
      const toIso   = req.query.to   ? String(req.query.to)   : localYmd(sunday);
      const rows = await scripts.studentsInSchool(fromIso, toIso);
      res.json({ from: fromIso, to: toIso, count: rows.length, rows });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  router.get('/nationality-mix', async (req, res) => {
    try {
      const localYmd = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const fromIso = req.query.from ? String(req.query.from) : localYmd(monthStart);
      const toIso   = req.query.to   ? String(req.query.to)   : localYmd(monthEnd);

      // One distinct student per nationality. A student with several
      // overlapping courses in the window still counts once (DISTINCT s.id).
      const rows = await prisma.$queryRaw<Array<any>>`
        SELECT COALESCE(NULLIF(TRIM(s.nationality), ''), 'Unknown') AS nationality,
               COUNT(DISTINCT s.id)::int                            AS count
        FROM students s
        JOIN bookings b        ON b.student_id = s.id
        JOIN booking_courses c ON c.booking_id = b.id
        WHERE (b.status IS NULL OR b.status <> 'CANCELLED')
          AND c.start_date <= ${toIso}::date
          AND c.end_date   >= ${fromIso}::date
          -- Exclude internal test records. Pattern is "test" + optional digits
          -- only (Test, TEST, Test26, test2) so it never catches real Italian
          -- surnames like Testa / Testi / Testori.
          AND s.first_name !~* '^test[0-9]*$'
          AND s.last_name  !~* '^test[0-9]*$'
        GROUP BY COALESCE(NULLIF(TRIM(s.nationality), ''), 'Unknown')
        ORDER BY count DESC, nationality ASC
      `;
      const total = rows.reduce((sum, r) => sum + Number(r.count), 0);
      res.json({ from: fromIso, to: toIso, total, rows });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // All students currently in a challenge (KickStart/CashBack) — admin report.
  // Must precede the bare /:id route below or 'challenges-report' is read as an id.
  router.get('/challenges-report', async (req, res) => {
    try { res.json(await portal.challengesReport(req.query.search ? String(req.query.search) : undefined)); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Staff mirror of the student-app social-post leaderboard (full ranked list).
  router.get('/challenge-leaderboard', async (req, res) => {
    try { res.json(await portal.challengeLeaderboardByMonth(req.query.month as string | undefined)); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // ── KickStart Challenger nudge (reminder drip) ──────────────────────────
  // Status for the Nudge tab + the suppress set the Challengers table reads.
  router.get('/challenger-nudge', async (_req, res) => {
    try {
      const [status, templates] = await Promise.all([
        nudge.getStatus(),
        prisma.documentTemplate.findMany({
          where: { slug: { in: ['challenger-nudge-1', 'challenger-nudge-2', 'challenger-nudge-3'] } },
          select: { id: true, slug: true, name: true, subject: true, htmlTemplate: true },
          orderBy: { slug: 'asc' },
        }),
      ]);
      res.json({ ...status, templates });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Master arm switch.
  router.post('/challenger-nudge/arm', async (req, res) => {
    try { res.json({ armed: nudge.setArmed(!!req.body?.armed) }); }
    catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Per-student Nudge toggle = the suppress list. body { studentId, nudge:bool }:
  // nudge=true → remove from suppress (will be nudged); nudge=false → add (suppressed).
  router.post('/challenger-nudge/suppress', async (req, res) => {
    try {
      const studentId = parseInt(String(req.body?.studentId), 10);
      if (!Number.isInteger(studentId)) return res.status(400).json({ error: 'bad studentId' });
      const on = req.body?.nudge !== false;   // default true (nudge on)
      const cur = new Set(nudge.loadConfig().suppress || []);
      if (on) cur.delete(studentId); else cur.add(studentId);
      const suppress = nudge.setSuppress([...cur]);
      res.json({ studentId, nudge: on, suppress });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // LifePass payments report — one row per LifePass booking: the onboard invoice
  // (booking.amountTotal/Paid) + its 25 sub drawdowns (paymentInstalments; allocated
  // = paid, past-due-unpaid = overdue) + TOTAL / PAID / BALANCE across both.
  router.get('/lifepass-report', async (req, res) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: { courses: { some: { name: { contains: 'Life Pass', mode: 'insensitive' } } } },
        select: {
          id: true, amountTotal: true, amountPaid: true,
          student: { select: { id: true, firstName: true, lastName: true } },
          paymentInstalments: {
            where: { cancelledAt: null },
            orderBy: { sequence: 'asc' },
            select: { sequence: true, amount: true, dueDate: true, allocationStatus: true, paidAt: true, xeroInvoiceNumber: true },
          },
        },
        orderBy: { id: 'asc' },
      });
      const today = new Date(); today.setHours(0, 0, 0, 0);

      // Collapse to one row per STUDENT. Deal-split leaves a student with two
      // LifePass bookings — the real 25-sub enrolment + an onboard-only shell on
      // a separate deal (see project_deal_split_phantom_bookings). We DON'T sum
      // the two €997 onboards (it's one pack split across deals, not two payments):
      // pick the CANONICAL booking (the one carrying the sub schedule; else the
      // most-paid) and flag any leftover shells so they can be reconciled/cleaned.
      const byStudent = new Map<number, any[]>();
      for (const b of bookings) {
        const sid = b.student?.id ?? -b.id; // no-student → its own bucket
        if (!byStudent.has(sid)) byStudent.set(sid, []);
        byStudent.get(sid)!.push(b);
      }

      const rows = Array.from(byStudent.values()).map((group: any[]) => {
        // Canonical = has instalments; tie-break on most onboard paid.
        const canonical = group.slice().sort((a, z) =>
          (z.paymentInstalments.length - a.paymentInstalments.length) ||
          (Number(z.amountPaid || 0) - Number(a.amountPaid || 0)),
        )[0];
        const shells = group.filter(g => g.id !== canonical.id);

        const onboardTotal = Number(canonical.amountTotal || 0);
        // Onboard paid = the most we've seen paid on ANY of the split bookings
        // (the onboard payment may have landed on the shell deal, not canonical).
        const onboardPaid = Math.max(...group.map(g => Number(g.amountPaid || 0)));
        const subs = canonical.paymentInstalments.map((pi: any) => {
          const paid = pi.allocationStatus === 'allocated';
          const overdue = !paid && pi.dueDate && new Date(pi.dueDate) < today;
          return {
            sequence: pi.sequence, amount: Number(pi.amount || 0), dueDate: pi.dueDate,
            status: paid ? 'paid' : (overdue ? 'overdue' : 'pending'),
          };
        });
        const subsTotal = subs.reduce((s: number, x: any) => s + x.amount, 0);
        const subsPaid = subs.filter((x: any) => x.status === 'paid').reduce((s: number, x: any) => s + x.amount, 0);
        const total = onboardTotal + subsTotal;
        const paid = onboardPaid + subsPaid;
        return {
          bookingId: canonical.id,
          studentId: canonical.student?.id ?? null,
          name: `${canonical.student?.firstName || ''} ${canonical.student?.lastName || ''}`.trim() || `Booking ${canonical.id}`,
          xeroInvoice: canonical.paymentInstalments[0]?.xeroInvoiceNumber || null,
          onboardTotal, onboardPaid,
          onboardStatus: (onboardTotal > 0 && onboardPaid >= onboardTotal) ? 'paid' : (onboardPaid > 0 ? 'part' : 'pending'),
          subs,
          total, paid, balance: total - paid,
          // Extra split bookings that should be merged/cleaned — surfaced as a flag.
          duplicateBookingIds: shells.map(s => s.id),
        };
      });
      // Sort by student name for a readable roster.
      rows.sort((a: any, z: any) => a.name.localeCompare(z.name));
      res.json({ rows, subCount: 25 });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.get('/:id', async (req, res) => {
    try {
      const student = await scripts.getById(parseInt(req.params.id));
      if (!student) return res.status(404).json({ error: 'Student not found' });
      // Derived: has the student created (and verified) their ULearn account?
      // Registration is a SisUser(userType='student') keyed by email, active=true
      // once verified — browser OR app, which is all we need to know here.
      let hasAccount = false;
      if ((student as any).email) {
        const acct = await prisma.sisUser.findFirst({
          where: { email: { equals: (student as any).email, mode: 'insensitive' }, userType: 'student', active: true },
          select: { id: true },
        });
        hasAccount = !!acct;
      }
      res.json({ ...student, hasAccount });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.post('/', async (req, res) => {
    try {
      const student = await scripts.create(req.body);
      res.status(201).json(student);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const body = { ...(req.body || {}) };
      // Stamp changedBy from session so the level-history audit credits a real
      // user instead of "anonymous". The body's own changedBy (if any) wins.
      if (body.changedBy == null) body.changedBy = (req as any).session?.user || null;
      const student = await scripts.update(parseInt(req.params.id), body);
      // If this edit touched any flight field, auto-seed the matching airport
      // extra's arrival datetime (fill-only-if-empty). Covers the admin student
      // page AND the Transport Edit modal (which saves flight via this route).
      const FLIGHT_KEYS = ['flightNumber', 'flightDate', 'flightTime', 'outboundFlightNumber', 'outboundFlightDate', 'outboundFlightTime'];
      if (FLIGHT_KEYS.some(k => k in body)) {
        const seeded = await syncArrivalFromFlight(prisma, parseInt(req.params.id));
        if (seeded.length) console.log(`[transport-sync] student ${req.params.id}: seeded scheduledAt on ${seeded.length} extra(s)`);
      }
      res.json(student);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await scripts.remove(parseInt(req.params.id));
      res.json({ deleted: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // ── Student Agreement (admin view + force re-sign) ────────────────────
  // Status for the student-detail card.
  router.get('/:id/contract-status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const s = await prisma.student.findUnique({ where: { id }, select: { contractSignedAt: true } });
      const sig = await prisma.studentSignature.findFirst({ where: { studentId: id }, orderBy: { id: 'desc' }, select: { mode: true, signerName: true, contractVersion: true, pdfPath: true, createdAt: true } });
      res.json({
        signed: !!s?.contractSignedAt,
        signedAt: s?.contractSignedAt ?? null,
        mode: sig?.mode ?? null,                       // 'typed' | 'drawn' | 'grandfathered'
        signerName: sig?.signerName ?? null,
        contractVersion: sig?.contractVersion ?? null,
        hasPdf: !!(sig?.pdfPath),
      });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Force re-sign (Neil's "Louis" case): clear the lifetime marker so the gate
  // surfaces again on next login. Keeps the historical signature rows for audit.
  router.post('/:id/contract/require-resign', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await prisma.student.update({ where: { id }, data: { contractSignedAt: null } });
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // ── Card on File (accommodation €1 card-guarantee) status + admin switch ──
  // The Accomm-section switch mirrors the Overview Agreement reset. GET is open
  // (everyone sees the state); POST is Accounts/Admin only.
  router.get('/:id/card-on-file', async (req, res) => {
    try {
      const s = await prisma.student.findUnique({
        where: { id: parseInt(req.params.id) },
        select: { cardOnFile: true, cardOnFileAt: true },
      });
      if (!s) return res.status(404).json({ error: 'Student not found' });
      res.json({ cardOnFile: !!s.cardOnFile, cardOnFileAt: s.cardOnFileAt });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Flip card-on-file. Writes BOTH sides: SIS Student.cardOnFile AND HubSpot
  // accommodation_card_guarantee (Yes/No) — otherwise /card-on-file/status
  // re-mirrors HubSpot and a reset self-heals straight back on.
  router.post('/:id/card-on-file', async (req, res) => {
    try {
      const role = (req.session as any)?.role || 'staff';
      if (role !== 'admin' && role !== 'accounts') return res.status(403).json({ error: 'Accounts / Admin only' });
      const id = parseInt(req.params.id);
      const on = req.body?.on === true || String(req.body?.on) === 'true';
      const student = await prisma.student.findUnique({ where: { id }, select: { hubspotContactId: true } });
      if (!student) return res.status(404).json({ error: 'Student not found' });

      await prisma.student.update({
        where: { id },
        data: on ? { cardOnFile: true, cardOnFileAt: new Date() } : { cardOnFile: false, cardOnFileAt: null },
      });

      let hubspot = 'no-contact';
      if (student.hubspotContactId) {
        try {
          const r = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${student.hubspotContactId}`, {
            method: 'PATCH',
            headers: { Authorization: 'Bearer ' + process.env.ACCESS_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({ properties: { accommodation_card_guarantee: on ? 'Yes' : 'No' } }),
          });
          hubspot = r.ok ? 'updated' : `failed:${r.status}`;
        } catch (e: any) { hubspot = `error:${e?.message || e}`; }
      }
      res.json({ success: true, cardOnFile: on, hubspot });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Serve the signed PDF for staff review.
  router.get('/:id/contract/signed.pdf', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sig = await prisma.studentSignature.findFirst({ where: { studentId: id, pdfPath: { not: null } }, orderBy: { id: 'desc' }, select: { pdfPath: true } });
      if (!sig?.pdfPath || !fs.existsSync(sig.pdfPath)) return res.status(404).send('No signed agreement on file');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="Student-Agreement-signed.pdf"');
      fs.createReadStream(sig.pdfPath).pipe(res);
    } catch (e) { res.status(500).send(String(e)); }
  });

  // ── Student document uploads (visa, passport, etc.) ──────────

  // List documents for a student
  router.get('/:id/documents', async (req, res) => {
    try {
      const docs = await prisma.studentDocument.findMany({
        where: { studentId: parseInt(req.params.id) },
        orderBy: { createdAt: 'desc' },
      });
      res.json(docs);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Upload one or more files. compressUploads() shrinks each file in place
  // (PDF → /printer 300dpi · image → 2200px/q92) before the DB row is written
  // so size on disk and StudentDocument.size match.
  router.post('/:id/documents', upload.array('files', 10), compressUploads(), async (req, res) => {
    try {
      const studentId = parseInt(String(req.params.id));
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) return res.status(400).json({ error: 'No files' });
      const category = String(req.body.category || 'visa');
      const uploadedBy = (req as any).session?.user || null;

      // Optional refundId — lets the same student-doc upload (the one the Operator
      // already uses for passports) ALSO lodge a visa-refusal letter onto a
      // RefundRequest. The refunds section is role-gated (service role can't hit
      // /refunds/:id/refusal-letter), so this reuses the allowed /students path.
      // When set we mirror each file into the refund's visa subfolder
      // (uploads/students/<id>/visa/) — which is where the refund's gate, file
      // viewer and TransferMate attach all read from — and link it to the refund.
      const refundId = req.body.refundId != null && String(req.body.refundId).trim() !== ''
        ? parseInt(String(req.body.refundId), 10) : null;
      let refund: { id: number; studentId: number | null; visaRefusalDocId: number | null } | null = null;
      if (refundId != null) {
        refund = await prisma.refundRequest.findUnique({ where: { id: refundId }, select: { id: true, studentId: true, visaRefusalDocId: true } });
        if (!refund) return res.status(404).json({ error: 'Refund not found' });
        if (refund.studentId != null && refund.studentId !== studentId) {
          return res.status(400).json({ error: 'Refund belongs to a different student' });
        }
      }

      const docs = [];
      for (const f of files) {
        if (refund) {
          // Mirror into the refund's visa folder (same filename) so refundScripts finds it.
          const visaDir = path.join(uploadDir, String(studentId), 'visa');
          fs.mkdirSync(visaDir, { recursive: true });
          try { fs.copyFileSync(f.path, path.join(visaDir, f.filename)); } catch { /* best-effort — the flat copy still exists */ }
        }
        const doc = await prisma.studentDocument.create({
          data: {
            studentId,
            filename: f.filename,
            originalName: f.originalname,
            mimeType: f.mimetype,
            size: f.size,
            category,
            uploadedBy,
            ...(refund ? { refundId: refund.id } : {}),
          } as any,
        });
        docs.push(doc);
      }

      // Link the refund: set its primary visa-refusal letter if none yet, and
      // backfill its studentId if it wasn't linked to a student.
      if (refund && docs.length) {
        const data: any = {};
        if (!refund.visaRefusalDocId) data.visaRefusalDocId = docs[0].id;
        if (refund.studentId == null) data.studentId = studentId;
        if (Object.keys(data).length) await prisma.refundRequest.update({ where: { id: refund.id }, data });
      }

      res.status(201).json(docs);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Serve a document. Default disposition is `attachment` (download). Pass
  // `?inline=1` to render in-browser instead — used by the admin Documents
  // list so staff can quick-preview a passport/photo without saving locally.
  router.get('/:id/documents/:docId/download', async (req, res) => {
    try {
      const doc = await prisma.studentDocument.findUnique({ where: { id: parseInt(req.params.docId) } });
      if (!doc || doc.studentId !== parseInt(req.params.id)) return res.status(404).json({ error: 'Not found' });
      const filePath = path.join(uploadDir, String(doc.studentId), doc.filename);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing from disk' });
      const inline = req.query.inline === '1' || req.query.inline === 'true';
      res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${doc.originalName}"`);
      res.setHeader('Content-Type', doc.mimeType);
      fs.createReadStream(filePath).pipe(res);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Read a stored document as a passport (AI vision) → suggested fields for a
  // human to confirm before saving. Never writes; same engine + human-confirm
  // contract as the partner-portal passport upload. Lets staff run extraction
  // on any image/PDF already in the student's document bucket.
  router.post('/:id/documents/:docId/read-passport', async (req, res) => {
    try {
      const doc = await prisma.studentDocument.findUnique({ where: { id: parseInt(req.params.docId) } });
      if (!doc || doc.studentId !== parseInt(req.params.id)) return res.status(404).json({ success: false, error: 'Not found' });
      const filePath = path.join(uploadDir, String(doc.studentId), doc.filename);
      if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, error: 'File missing from disk' });

      // The reader FORKS into 3: passport / medical / learner_protection. `as`
      // lets the confirm dialog's "File As" override force a specific fork when
      // auto-detect got it wrong. NOTHING is saved here — the human confirms in
      // the dialog, and the save endpoint persists it. (auto = detect.)
      const as = String((req.body && req.body.as) || 'auto');
      const { extractPdfText, classifyInsurance, extractInsuranceFields, INSURANCE_META } = await import('../scripts/insurance-classifier');
      const iso = (d: Date | null) => d ? d.toISOString().slice(0, 10) : null;
      const isPdf = (doc.mimeType || '').includes('pdf');
      const insuranceResult = (sub: 'medical' | 'learner_protection', text: string) => {
        const f = extractInsuranceFields(text, sub);
        return { success: true, insurance: sub, insuranceName: INSURANCE_META[sub].name, fields: { policyNumber: f.policyNumber, from: iso(f.from), until: iso(f.until), premium: f.premium } };
      };

      if (as === 'medical' || as === 'learner_protection') {
        return res.json(insuranceResult(as, isPdf ? await extractPdfText(filePath) : ''));
      }
      if (as !== 'passport' && isPdf) {  // auto
        const text = await extractPdfText(filePath);
        const sub = classifyInsurance(text);
        if (sub) return res.json(insuranceResult(sub, text));
      }
      const pp = await parsePassport(filePath, doc.mimeType);
      const birthdaySet = await fillBirthdayIfEmpty(prisma, doc.studentId, pp.extracted);
      res.json({ success: true, supported: pp.supported, extracted: pp.extracted, parseError: pp.error || null, birthdaySet });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // Confirm + save an insurance read: persist the (human-checked) fields and
  // file the policy as a ULearn Document. The upload stays in the bucket.
  router.post('/:id/documents/:docId/save-insurance', async (req, res) => {
    try {
      const sid = parseInt(req.params.id);
      const doc = await prisma.studentDocument.findUnique({ where: { id: parseInt(req.params.docId) } });
      if (!doc || doc.studentId !== sid) return res.status(404).json({ success: false, error: 'Not found' });
      const type = String(req.body?.type || '');
      if (type !== 'medical' && type !== 'learner_protection') return res.status(400).json({ success: false, error: 'Bad type' });
      const { documentScripts } = await import('../scripts/documents');
      const bk = await prisma.booking.findFirst({ where: { studentId: sid }, orderBy: { id: 'desc' }, select: { id: true } });
      const r = await documentScripts(prisma).saveInsurancePolicy({
        studentId: sid, bookingId: bk?.id ?? null, subtype: type,
        fields: { policyNumber: req.body?.policyNumber, from: req.body?.from, until: req.body?.until },
        attachedRelPath: path.join('students', String(sid), doc.filename),
        originalName: doc.originalName, uploadedBy: (req as any).session?.user || 'admin',
      });
      // B2C students have no agency on any booking → the notify dialog drops the Agent option.
      const agencyBk = await prisma.booking.findFirst({ where: { studentId: sid, agencyId: { not: null } }, select: { id: true } });
      res.json({ success: true, ...r, hasAgency: !!agencyBk });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Challenges (admin verify) ──
  // Returns the same payload the student sees, so admin UI can mirror state.
  router.get('/:id/challenges', async (req, res) => {
    try { res.json(await portal.challenges(parseInt(req.params.id, 10))); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.patch('/:id/challenges/verify', async (req, res) => {
    try {
      const by = (req as any).session?.user || null;
      res.json(await portal.adminSetVerify(parseInt(req.params.id, 10), req.body || {}, by));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.patch('/challenges/content/:contentId/verify', async (req, res) => {
    try {
      const by = (req as any).session?.user || null;
      const verified = !!(req.body && req.body.verified);
      res.json(await portal.adminVerifyContent(parseInt(req.params.contentId, 10), verified, by));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.delete('/challenges/content/:contentId', async (req, res) => {
    try { res.json(await portal.adminDeleteContent(parseInt(req.params.contentId, 10))); }
    catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Delete a document
  router.delete('/:id/documents/:docId', async (req, res) => {
    try {
      const doc = await prisma.studentDocument.findUnique({ where: { id: parseInt(req.params.docId) } });
      if (!doc || doc.studentId !== parseInt(req.params.id)) return res.status(404).json({ error: 'Not found' });
      const filePath = path.join(uploadDir, String(doc.studentId), doc.filename);
      // Only unlink the physical file if no ISSUED document (e.g. an insurance
      // policy filed as a ULearn Document) still points at it — otherwise we'd
      // orphan that document. The bucket row goes either way.
      const relPath = path.join('students', String(doc.studentId), doc.filename);
      const linked = await prisma.documentRecord.findFirst({ where: { attachedFilePath: relPath } as any, select: { id: true } });
      if (!linked && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await prisma.studentDocument.delete({ where: { id: doc.id } });
      res.json({ deleted: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // ── Feedback the student has given (accommodation + social) ──
  // Lesson feedback lives in lms_lms (not surfaced here — see the LMS student
  // profile for that). This endpoint covers the SIS-owned streams only.
  router.get('/:id/feedback', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const [accomm, social] = await Promise.all([
        prisma.accommodationFeedback.findMany({
          where: { studentId: id, stars: { not: null } },
          orderBy: [{ weekStart: 'desc' }],
          include: {
            bookingAccommodation: {
              select: {
                id: true, accommodationType: true, roomType: true,
                bed: { select: { room: { select: { property: { select: { name: true, provider: { select: { name: true } } } } } } } },
              },
            },
          },
        }),
        prisma.socialActivityFeedback.findMany({
          where: { studentId: id, stars: { not: null } },
          orderBy: [{ createdAt: 'desc' }],
          include: { activity: { select: { id: true, date: true, title: true, location: true } } },
        }),
      ]);
      res.json({
        accommodation: accomm.map(f => ({
          id: f.id, week_start: f.weekStart, stars: f.stars, comment: f.comment, status: f.status,
          provider: f.bookingAccommodation?.bed?.room?.property?.provider?.name || null,
          property: f.bookingAccommodation?.bed?.room?.property?.name || null,
          accommodation_type: f.bookingAccommodation?.accommodationType || null,
          room_type: f.bookingAccommodation?.roomType || null,
          created_at: f.createdAt,
        })),
        social: social.map(f => ({
          id: f.id, stars: f.stars, comment: f.comment, status: f.status,
          activity_id: f.activity?.id || null,
          activity_title: f.activity?.title || null,
          activity_date: f.activity?.date || null,
          activity_location: f.activity?.location || null,
          created_at: f.createdAt,
        })),
      });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // ── Visa-approval 4-week notice ─────────────────────
  // Preview: returns rendered HTML so admin can eyeball before sending.
  router.get('/:id/visa-approval-notice/preview', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const html = await scripts.renderVisaApprovalNotice(id);
      res.json({ html });
    } catch (e: any) { res.status(400).json({ error: e?.message || String(e) }); }
  });
  // Send: idempotent — refuses to re-send once visaApprovalNoticeSentAt is set.
  router.post('/:id/visa-approval-notice/send', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await scripts.sendVisaApprovalNotice(id);
      res.json(result);
    } catch (e: any) { res.status(400).json({ error: e?.message || String(e) }); }
  });
  // Reset: clears the visa-notice timestamps so the CTA reappears on next
  // approval. Admin-only — gates at the route since this affects an audit
  // signal (ie clearing noticeSentAt could enable a duplicate send).
  router.post('/:id/visa-approval-notice/reset', async (req, res) => {
    const role = (req.session as any).role || 'staff';
    if (role !== 'admin') return res.status(403).json({ error: 'admin only' });
    try {
      const result = await scripts.resetVisaNoticeState(parseInt(req.params.id));
      res.json(result);
    } catch (e: any) { res.status(400).json({ error: e?.message || String(e) }); }
  });

  return router;
}
