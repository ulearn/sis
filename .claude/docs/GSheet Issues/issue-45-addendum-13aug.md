# Issue 45 Addendum 13 Aug 2026 (77th check) -- Mass Stale Booking Courses

Reporter: AC  Area: Renewal students  Sheet row: 47

## Root Cause (77th check -- Thu 13 Aug UTC, no change)
- Active Booking Courses with end_date before 2026-08-13: 24,479 (stale, active = true)
- Active Booking Courses with end_date on or after 2026-08-13: 283 (live)
- SIS does not auto-deactivate ended booking courses
- Arrivals list filters active=true -- stale records pollute the list

## Fix Recipe -- NOT YET RUN

Mass deactivation (run in sis/ directory -- NOT YET RUN):
  UPDATE booking_course SET active = false WHERE active = true AND end_date < NOW();
  Expected: 24,479 rows updated.

Verify after:
  SELECT count(*) FROM booking_course WHERE active = true AND end_date < NOW();
  Expect: 0

## Risk
Category: data-hygiene. Reversible (reactivate by id if needed).
Blast radius: 24,479 records -- run during low-traffic period.
Confirm with Neil before executing.

## Status
Fix NOT RUN. 77 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC (77th check)
