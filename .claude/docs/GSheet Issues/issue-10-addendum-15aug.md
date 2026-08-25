# Issue 10 — Massimiliano Cameran (no completion cert; stale BCs)
Reporter: AC | Area: Doc Gen/Certs | Row 11 | 52nd check Sat 15 Aug 2026 UTC — no change

ROOT CAUSE (live data, verified 15 Aug 2026):
- Booking 97 (Massimiliano Cameran, student 1): CONFIRMED, confirmed = false — anomaly (EUR 1,741 paid, amountOpen = 0)
- Booking Course 107 (Morning General): ended 2026-05-22 — 85 days stale, active, 1 SCA (expected historical)
- Booking Course 24793 (General English AM): ended 2026-06-05 — 71 days stale, active, 1 SCA (expected historical)
- Documents on booking 97: doc 63 (Net-to-Gross Invoice REVOKED), doc 64 (Net-to-Gross Invoice ISSUED)
  NO completion certificate exists for this booking

FIX RECIPE (NOT YET RUN):
1. Verify SCAs on BCs 107 + 24793 are historical (weekEnd before course end date):
   SELECT id, week_start, week_end FROM student_class_assignment WHERE booking_course_id IN (107, 24793);
2. Set booking 97 confirmed = true:
   UPDATE booking SET confirmed = true WHERE id = 97;
3. Deactivate BCs 107 + 24793:
   UPDATE booking_course SET active = false WHERE id IN (107, 24793);
4. Generate completion certificate: Admin UI -> Student 1 -> Booking 97 -> generate cert.

RISK: Documents; reversible. Blast radius: 1 booking, 2 booking courses, 1 cert to generate.
STATUS: OPEN — no change. Fix NOT RUN.
Last checked: Sat 15 Aug 2026 UTC (52nd check)