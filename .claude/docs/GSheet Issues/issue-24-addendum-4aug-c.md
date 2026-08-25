# Issue 24 — Alberto Squillace: SCA Overdue (53rd check Tue 4 Aug 2026 UTC)
Reporter: NM | Area: Booking/Classes | Sheet row: 25

## Root Cause (verified 2026-08-04 UTC, 53rd check — unchanged)
- Student 1052 (Alberto Squillace), booking 1611.
- Booking course 1797 (Morning General, ended 2026-06-26): active = true — 39 days stale, 1 class assignment.
- Booking course 24686 (Morning General, 2026-07-20 to 2026-09-18): active = true — 0 class assignments.
  16 days into course (started Jul 20) without a class assignment.

## Fix Recipe (NOT YET RUN)
Step 1 — Deactivate stale BC 1797:
  UPDATE booking_courses SET active = false WHERE id = 1797;

Step 2 — Create class assignment for BC 24686 via SIS admin (assign Alberto to a Morning General class).

Step 3 — Verify:
  SELECT id, active FROM booking_courses WHERE id IN (1797, 24686);
  SELECT id, class_id, week_start FROM student_class_assignments WHERE booking_course_id = 24686;

## Risk: bookings, attendance | Reversible: yes | Blast radius: 1 student
## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (53rd check) | 16 days since Jul 20 start