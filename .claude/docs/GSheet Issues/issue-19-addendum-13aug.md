Issue 19 Addendum 13 Aug 2026 (11th check) -- Stale Booking Courses

Reporter: Unknown  Area: Class Assignment  Sheet row: 20

Symptom
Student not appearing in class-to-be-assigned list.

Root cause (11th check -- Thu 13 Aug UTC)
- Booking Course 89 (Morning IELTS, booking 83): ended 2026-05-22 -- 83 days stale, active = true
  Class Assignment 250: class 10, weekStart 2026-04-13 -- historical record
- Booking Course 90 (Private Lessons, booking 83): ended 2026-05-22 -- 83 days stale, active = true, 0 class assignments
- Booking 83: CONFIRMED, confirmed = true, EUR 2,629.80 fully paid
- Unchanged from 10th check (Wed 12 Aug)

Fix recipe (NOT YET RUN)
Step 1 -- Deactivate Booking Course 90 (0 class assignments, safe -- NOT YET RUN):
  UPDATE booking_course SET active = false WHERE id = 90;
Step 2 -- Review BC 89 before deactivating:
  Class Assignment 250 is historical (class 10, Apr 2026). Confirm with staff that deactivating
  BC 89 will not break attendance reporting, then run:
  UPDATE booking_course SET active = false WHERE id = 89;  -- NOT YET RUN

Risk: data-hygiene. Reversible (set active=true). Blast: 2 completed BCs, 1 booking.

Status: open -- fix NOT RUN. 11 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC