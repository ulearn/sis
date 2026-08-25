# Issue 45 — Stale Booking Courses Count (26th check Tue 4 Aug 2026 UTC)
Reporter: AC | Area: Renewal students | Sheet row: 47

## Root Cause (verified 2026-08-04 UTC, 26th check — unchanged)
- 24,467 booking courses with active = true and end_date < 2026-08-04.
- Booking course 25006 (Marina Larripa, ended 2026-08-03): 2 days stale, still in count.
- Awaiting decision on bulk deactivation.

## Fix Recipe (NOT YET RUN)
  -- Dry run:
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < '2026-08-04';
  -- Execute:
  UPDATE booking_courses SET active = false WHERE end_date < '2026-08-04' AND active = true;

## Risk: data-hygiene | Reversible: yes | Blast radius: 24,467 rows | Awaiting decision
## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (26th check)