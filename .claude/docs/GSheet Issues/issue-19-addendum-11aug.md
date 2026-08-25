# Issue 19 — Maï Lan Chu: Booking Courses 89+90 Stale (9th check, Tue 11 Aug 2026 UTC)
Reporter: Staff | Area: Booking / Class | Sheet row: 20

## Status
Unchanged from 8th check (Mon 10 Aug 2026). Both Booking Courses 89 and 90 now 81 days stale.

## Root Cause
- Booking Course 89 (Morning IELTS, booking 83): ended 2026-05-22 — 81 days stale, active = true
- Booking Course 90 (Private Lessons, booking 83): ended 2026-05-22 — 81 days stale, active = true
- Both on booking 83. Fix not applied.

## Fix Recipe (NOT YET RUN)
Step 1 — Deactivate Booking Courses 89 and 90:
  UPDATE booking_courses SET active = false WHERE id IN (89, 90);

Step 2 — Verify:
  SELECT id, end_date, active FROM booking_courses WHERE id IN (89, 90);
  Expected: both active = false.

## Risk / Category
Data-hygiene. Reversible. Blast radius: student on booking 83 only.

## Last checked: 2026-08-11 UTC