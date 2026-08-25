Issue 45 -- Stale Booking Courses / Renewal Arrivals (44th check, 8 Aug 2026)
Reporter: Staff | Area: Renewal Students | Sheet row: 47

24,479 booking courses: active=true, end_date < 2026-08-08. Unchanged from previous check.
14 ended during 1-7 Aug. 0 ended today (8 Aug). Total unchanged.

Fix (NOT YET RUN):
-- DRY RUN:
SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;
-- Execute:
UPDATE booking_courses SET active = false WHERE active = true AND end_date < CURRENT_DATE;
-- Verify:
SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE; -- expect 0

Category: Data hygiene | Reversible: Yes | Blast: 24,479 rows (reporting only)
Last checked: 2026-08-08 UTC (44th check)