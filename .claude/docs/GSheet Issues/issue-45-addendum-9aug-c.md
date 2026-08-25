Issue 45 - Stale Booking Courses (Renewal Arrivals) - 47th check Sun 9 Aug 2026 UTC
Sheet row: 47

STATUS: UNCHANGED. 24,479 stale booking courses confirmed by fresh DB query this run (22:xx UTC).
Hash changed: B/F/G updated in sheet since last check. Core data unchanged.

FRESH COUNTS (Sun 9 Aug 2026):
  Total active booking courses: 24,762
  Stale (ended before 2026-08-09): 24,479 (99%)
  Ended Aug 7-8 (newly stale, 13 BCs): already counted in 24,479

ROOT CAUSE:
Booking courses are never automatically deactivated when end_date passes.
active=true on ended BCs prevents renewal students from appearing on arrivals list.

FIX RECIPE (NOT YET RUN):
  Preview count:
    SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < '2026-08-09';
    -- Expected: 24,479

  Run off-hours in transaction:
    UPDATE booking_courses SET active = false WHERE active = true AND end_date < '2026-08-09';

  Verify (expected 0 after run):
    SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;

RISK: bookings/data-hygiene | Bulk 24,479 rows | Reversible | No financial impact | Run off-hours.
STATUS: NOT RUN
Last checked: 2026-08-09 UTC (47th check)
