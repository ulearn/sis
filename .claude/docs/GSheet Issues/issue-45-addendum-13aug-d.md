# Issue 45 — Stale Booking Courses mass deactivation (13 Aug d)

Reporter: AC | Sheet row: 47 | Last checked: 2026-08-13 UTC (80th hourly check)

## Root cause
- Active Booking Courses with end_date < 2026-08-13: 24,479 (unchanged from 79th check earlier today)
- Live Booking Courses (end_date >= 2026-08-13): 283
- Hash changed since 79th check — likely manual sheet edit to B/F/G; DB data unchanged

## Fix recipe (NOT YET RUN)
Step 1 — Dry run:
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;
Step 2 — Mass deactivate in a transaction:
  BEGIN;
  UPDATE booking_courses SET active = false WHERE active = true AND end_date < CURRENT_DATE;
  -- Verify count = 0 before committing
  COMMIT;
Step 3: Verify arrivals list shows renewal students correctly.

## Status
Open — 24,479 stale Booking Courses. Fix NOT RUN.
Last checked: 2026-08-13 UTC (80th hourly check)