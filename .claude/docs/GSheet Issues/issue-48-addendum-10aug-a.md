# Issue 48 — Telmuun 6 Stale BCs + Ana Jessica EUR 1,530 (85th check)

Reporter: AC | Area: Attendance/classes | Sheet row: 50

## Root Cause (85th check — Mon 10 Aug 2026 UTC)
Unchanged from 84th check (9 Aug).

Telmuun Enkhsaikhan (student 293) — 6 stale active Booking Courses:
- BC 482 | Academic Year Afternoon | endDate 2025-03-14 | 514 days stale
- BC 483 | Academic Year Afternoon | endDate 2025-07-11 | 395 days stale
- BC 1609 | Academic Year Renewal Afternoon | endDate 2025-12-19 | 234 days stale
- BC 1610 | Academic Year Renewal Afternoon | endDate 2026-01-09 | 213 days stale
- BC 1611 | Academic Year Renewal Afternoon | endDate 2026-03-06 | 157 days stale
- BC 1612 | Academic Year Renewal Afternoon | endDate 2026-05-01 | 101 days stale

KEEP — current course:
- BC 1810 (Academic Year Renewal Morning, 2026-06-29 to 2027-01-01): active=true — DO NOT DEACTIVATE

Ana Jessica Rosa de Paula Santos: EUR 1,530 unresolved — refund or reallocate. Neil must decide.

## Fix Recipe (NOT YET RUN)

Step 1 — Deactivate 6 stale Telmuun BCs:
  UPDATE "BookingCourse" SET active = false, "updatedAt" = NOW()
  WHERE id IN (482, 483, 1609, 1610, 1611, 1612);

Step 2 — Verify:
  SELECT id, active FROM "BookingCourse" WHERE id IN (482, 483, 1609, 1610, 1611, 1612);
  -- Expected: all active=false
  SELECT id, active, "endDate" FROM "BookingCourse" WHERE id = 1810;
  -- Expected: active=true, endDate=2027-01-01

Step 3 — Ana Jessica EUR 1,530: manual decision in Xero/Hub (refund or new booking).

## Risk / Category
Category: bookings / data-hygiene | Reversible: yes | Blast radius: 1 student (Telmuun) + separate financial decision

## Status: Open — Fix Not Run (85th check)
Last checked: 2026-08-10 UTC