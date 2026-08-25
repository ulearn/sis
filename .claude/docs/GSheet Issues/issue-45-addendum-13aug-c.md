Issue 45 Addendum 13 Aug 2026 (79th check) -- Mass Stale Booking Courses

Reporter: AC  Area: Renewal students  Sheet row: 47

Root Cause (79th check -- Thu 13 Aug UTC, 237th hourly run, no change)
- Active Booking Courses with end_date before 2026-08-13: 24,479 (stale, active = true)
- Active Booking Courses with end_date on or after 2026-08-13: 283 (live)
- SIS does not auto-deactivate ended booking courses

Fix Recipe -- NOT YET RUN
  UPDATE booking_course SET active = false WHERE active = true AND end_date < NOW();
  Expected: ~24,479 rows updated.
  Verify: SELECT count(*) FROM booking_course WHERE active = true AND end_date < NOW(); -- expect 0

Risk: data-hygiene. Reversible. Blast radius: ~24,479 records. Run during low-traffic.
Status: Fix NOT RUN. 79 consecutive checks. Last checked: Thu 13 Aug 2026 UTC
