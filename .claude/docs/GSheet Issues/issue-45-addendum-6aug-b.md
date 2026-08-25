# Issue 45 — Renewal Students / Stale Booking Courses (32nd check, Thu 6 Aug 2026 18:00 UTC)

Reporter: AC | Area: Renewal students | Sheet row: 47

## Root cause (32nd check)
Total stale booking courses (active=true, end_date < today): 24,466 (dropped by 1 from 24,467).

Specifically stale (newly tracked):
- BC 25006 (General English AM Plus, booking 18228): ended 3 Aug 2026 - 3 days stale, 2 SCAs
- BC 24630 (General English AM Plus, booking 17857): ended 10 Jul 2026 - 27 days stale, 0 SCAs
- BC 24631 (General English AM Plus, booking 17856): ended 10 Jul 2026 - 27 days stale, 0 SCAs

NEW ANOMALY (found this check):
BC 24213: end_date = 1899-12-30 (corrupted Fidelo migration date, 46,239 days stale).
Does not affect live students but inflates the stale count and may cause issues in date queries.

## Fix recipe (NOT YET RUN)

Step 1 - Deactivate 3 known stale BCs:
  UPDATE booking_courses SET active = false WHERE id IN (25006, 24630, 24631);

Step 2 - Fix BC 24213 corrupted date:
  SELECT * FROM booking_courses WHERE id = 24213;  -- check first
  UPDATE booking_courses SET active = false WHERE id = 24213;

Step 3 - Batch deactivate all stale BCs (AWAITING NEIL DECISION):
  BEGIN;
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;
  UPDATE booking_courses SET active = false WHERE active = true AND end_date < CURRENT_DATE;
  -- COMMIT or ROLLBACK after verifying count

## Risk
Steps 1+2: low, reversible. Step 3: medium (24,466 records), fully reversible.

## Status
24,466 stale. BC 25006 newly stale (3d, 2 SCAs). Anomaly: BC 24213 end_date=1899. Batch pending.
Last checked: Thu 6 Aug 2026 18:00 UTC (32nd check)