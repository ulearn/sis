# Issue 45 — 24,479 Stale Booking Courses (53rd check)

Reporter: AC | Area: Renewal students | Sheet row: 47

## Root Cause (53rd check — Mon 10 Aug 2026 UTC)
Unchanged from 52nd check (9 Aug).

- Total active booking courses: 24,762
- Stale (endDate before 2026-08-10): 24,479 — 99% of all active records
- Current (endDate >= 2026-08-10): 283

## Fix Recipe (NOT YET RUN)

IMPORTANT: Run in a transaction with a COUNT check first.

Step 1 — Verify count before running:
  SELECT COUNT(*) FROM "BookingCourse"
  WHERE active = true AND "endDate" < '2026-08-10';
  -- Expected: ~24,479. If wildly different, abort.

Step 2 — Mass deactivate (run in transaction):
  BEGIN;
  UPDATE "BookingCourse"
  SET active = false, "updatedAt" = NOW()
  WHERE active = true AND "endDate" < '2026-08-10';
  -- Check rows affected, then:
  COMMIT;  -- or ROLLBACK if count looks wrong

Step 3 — Verify:
  SELECT COUNT(*) FROM "BookingCourse" WHERE active = true AND "endDate" < '2026-08-10';
  -- Expected: 0
  SELECT COUNT(*) FROM "BookingCourse" WHERE active = true;
  -- Expected: ~283

Step 4 — Spot check no current courses deactivated:
  SELECT id, name, "endDate", active FROM "BookingCourse"
  WHERE "endDate" >= '2026-08-10' AND active = false
  ORDER BY "endDate" ASC LIMIT 20;
  -- Expected: 0 rows. If any, investigate.

## Risk / Category
Category: data-hygiene / bookings | Reversible: complex at scale | Blast radius: 24,479 rows; high query impact

## Status: Open — Fix Pending Neil Approval
Last checked: 2026-08-10 UTC (53rd hourly check)