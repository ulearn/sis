# Issue 10 — Massimiliano Cameran (cert split / stale BCs)
Reporter: AC | Area: Doc Gen/Certs | Row 11 | 53rd check Sun 16 Aug 2026 UTC — no change

ROOT CAUSE (live data, verified 16 Aug 2026):
- Booking 97 (Massimiliano Cameran, student 1): CONFIRMED, confirmed = false — anomaly (fully paid EUR 1,741, amountOpen = 0)
- Booking Course 107 (Morning General): ended 2026-05-22 — 86 days stale, active, 1 class assignment (historical)
- Booking Course 24793 (General English AM): ended 2026-06-05 — 72 days stale, active, 1 class assignment (historical)
- Documents on booking 97: doc 64 (Net-to-Gross Invoice, ISSUED) — no completion certificate generated

FIX RECIPE (NOT YET RUN):
1. Verify class assignments on BC 107 and 24793 are historical (weekEnd < endDate):
   SELECT id, week_start, week_end FROM student_class_assignments WHERE booking_course_id IN (107, 24793);
2. Set booking 97 confirmed = true (fully paid, no open balance):
   UPDATE booking SET confirmed = true WHERE id = 97;
3. Deactivate BC 107 and 24793 (historical class assignments only — safe):
   UPDATE booking_course SET active = false WHERE id IN (107, 24793);
4. Generate completion certificate for booking 97 via admin UI (no cert exists yet).

RISK: Documents/bookings; reversible. Blast radius: 1 booking, 2 booking courses, 1 document.
STATUS: OPEN — no change. Fix NOT RUN.
Last checked: Sun 16 Aug 2026 UTC (53rd check)
