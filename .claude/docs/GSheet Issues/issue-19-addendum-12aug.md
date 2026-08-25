# Issue 19 — Mai Lan Chu: Booking Courses 89+90 Stale (10th check, Wed 12 Aug 2026 UTC)
Reporter: Staff | Area: Booking / Class | Sheet row: 20

## Status
Unchanged from 9th check (Tue 11 Aug 2026). Both Booking Courses 89 and 90 now 82 days stale.

## Root Cause
- Booking Course 89 (Morning IELTS, booking 83): ended 2026-05-22 — 82 days stale, active = true, 1 class assignment (id 250)
- Booking Course 90 (Private Lessons, booking 83): ended 2026-05-22 — 82 days stale, active = true, 0 class assignments
- Booking 83: CONFIRMED, confirmed = true, EUR 2,629.80 fully paid — no open balance
- Caution: Booking Course 89 has 1 class assignment (id 250) — must verify it is historical before deactivating

## Fix Recipe (NOT YET RUN)
Step 1 — Inspect class assignment 250 on BC 89:
  SELECT sca.*, c.level, c.session FROM student_class_assignment sca JOIN class c ON c.id = sca.class_id WHERE sca.id = 250;
  Confirm weekEnd is in the past and the student is no longer in this class.

Step 2 — Deactivate Booking Courses 89 and 90:
  UPDATE booking_course SET active = false WHERE id IN (89, 90);

## Risk / Category
Data-hygiene. Reversible. Blast radius: student on booking 83 only.

## Status: Open — fix NOT RUN.
## Last checked: 2026-08-12 UTC