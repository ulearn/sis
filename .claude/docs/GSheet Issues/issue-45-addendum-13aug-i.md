# Issue 45 — Stale Active Booking Courses (85th check Thu 13 Aug 2026)

Reporter: Staff (AC) | Area: Renewal students | Sheet row: 47
85th check — Thu 13 Aug 2026 ~20:00 UTC

## Symptom
Thousands of active Booking Courses have end dates in the past.
These inflate counts and corrupt arrivals lists.

## Root Cause (evidence)
- Active Booking Courses with endDate before 2026-08-13: 24,479 (unchanged from 84th check)
- Live active Booking Courses (endDate on or after 2026-08-13): 285 (unchanged)
- No change since 84th check

## Fix Recipe (NOT YET RUN)

Step 1: Dry run — count and inspect:
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < NOW();  -- NOT YET RUN

Step 2: Deactivate all stale active Booking Courses:
  UPDATE booking_courses SET active = false WHERE active = true AND end_date < NOW();  -- NOT YET RUN
  (Expected: 24,479 rows updated)

Step 3: Verify live count unchanged after update:
  SELECT COUNT(*) FROM booking_courses WHERE active = true;  -- should return ~285  -- NOT YET RUN

## Risk / Category
data-hygiene | Reversible: yes (set active = true WHERE id IN (...)) | Blast radius: 24,479 rows,
  but all end dates are in the past so no operational impact expected.
  Recommend taking a backup snapshot before running.

## Status
OPEN. 24,479 stale active Booking Courses unchanged. Fix NOT RUN.

Last checked: Thu 13 Aug 2026 ~20:00 UTC
Previous recipe: issue-45-addendum-13aug-h.md