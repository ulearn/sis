# Issue 45 -- 24,479 Stale Booking Courses Still Active

**Reporter:** Staff | **Area:** Renewal students | **Sheet row:** 47 | **Check:** Tue 11 Aug 2026 UTC

## Root cause (live data, 11 Aug 2026)
- **Total active Booking Courses:** 24,763
- **Stale (ended before 2026-08-11):** 24,479 -- 98.9%
- **Current (ends 2026-08-11 or later):** 284 (+1 from yesterday due to date change)
- Mass deactivation not run; count unchanged from Mon 10 Aug

## Fix recipe (NOT YET RUN)

BACKUP FIRST:
CREATE TABLE booking_course_backup_20260811 AS SELECT * FROM booking_course WHERE active = true AND end_date < NOW();

THEN DEACTIVATE:
UPDATE booking_course SET active = false WHERE active = true AND end_date < NOW(); -- NOT YET RUN

VERIFY:
SELECT COUNT(*) FROM booking_course WHERE active = true; -- expect ~284
SELECT COUNT(*) FROM booking_course WHERE active = false AND end_date < NOW(); -- expect ~24479

## Risk / category
- **Category:** data-hygiene / bookings | **Reversible?** Yes (backup table) | **Blast radius:** 24,479 rows

## Status
Open -- fix pending Neil approval.
**Last checked:** Tue 11 Aug 2026 UTC (60th check, Issue 45)