Issue 45 - Stale Booking Courses (Renewal Arrivals) - 46th check Sun 9 Aug 2026 UTC
Sheet row: 47

ROOT CAUSE:
24,479 stale booking courses (active=true, end_date < 2026-08-09) - unchanged from 45th check.

14 BCs ended Aug 3-8 (all now counted in stale total):
  BC 25038, 1673, 1672, 1740, 1675, 1742, 24966, 24983, 24955, 24967, 24991, 24990, 88 (ended Aug 7)
  BC 25006 (ended Aug 3)

Aug 9 (Sunday): 0 new BC ends today.

Stale active BCs from prior courses prevent renewal students new BCs from appearing on arrivals list.

FIX RECIPE (NOT YET RUN):
Preview count:
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < '2026-08-09';
  Expected: ~24479

Run in transaction, off-hours:
  UPDATE booking_courses SET active = false WHERE active = true AND end_date < '2026-08-09';

Verify:
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;
  Expected: 0

RISK: bookings/data-hygiene | Bulk 24479 rows | Reversible | No financial impact | Run off-hours.
STATUS: NOT RUN. Count unchanged at 24479.
Last checked: 2026-08-09 UTC (46th check)