# Issue 12 — Rakan BC 25035: Day 8, 0 SCAs

Reporter: KC | Area: Booking / Accomm | Sheet row: 13

## Root Cause (145th check — Mon 10 Aug 2026 UTC)
- BC 25035 (Rakan Alghamdi, General English Academic Year AM Plus, 2026-08-03 to 2026-12-18): active=true, 0 class assignments. Day 8 with no placement.
- BC 24697 (Academic Year Morning, old course): still active=true. Has SCA 288 (week_start=2026-07-06).
- SCA 288 was never moved from old BC 24697 to new BC 25035 when the new course started 3 Aug.

## Fix Recipe (NOT YET RUN)

Step 1 — Deactivate old BC 24697:
  UPDATE "BookingCourse" SET active = false, "updatedAt" = NOW() WHERE id = 24697;

Step 2 — Move SCA 288 to BC 25035 with current week start:
  UPDATE "StudentClassAssignment"
  SET "bookingCourseId" = 25035, "weekStart" = '2026-08-10', "updatedAt" = NOW()
  WHERE id = 288;

Step 3 — Verify:
  SELECT sca.id, sca."bookingCourseId", sca."weekStart" FROM "StudentClassAssignment" WHERE id = 288;
  -- Expected: bookingCourseId=25035, weekStart=2026-08-10
  SELECT id, active FROM "BookingCourse" WHERE id IN (24697, 25035);
  -- Expected: 24697 active=false, 25035 active=true

## Risk / Category
Category: bookings / class operations | Reversible: yes | Blast radius: 1 student (Rakan), 8 days untracked attendance

## Status: CRITICAL — Day 8 No Placement
Last checked: 2026-08-10 UTC (145th hourly check)