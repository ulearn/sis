# Issue 12 — Rakan Alghamdi SCA Mislink (Addendum 9 Aug-b)

**Check:** 133rd Sun 9 Aug 2026 UTC | **Row:** 13 | URGENT: classes restart TOMORROW Mon 10 Aug

## Current State (fresh query, 9 Aug 2026)

Booking Course 24697 (Academic Year Morning, ended 2026-07-31):
  active = true (stale)
  Class Assignment 288: class 12, weekStart 2026-07-06, weekEnd 2026-12-18
  weekEnd extends 140 days PAST course end — MISLINKED

Booking Course 25035 (General English Academic Year AM Plus, 2026-08-03 to 2026-12-18):
  active = true
  classAssignments: 0 — Rakan has no assignment on his live course

From Monday: Rakan on class 12 register via old Booking Course 24697, but SIS shows him
unassigned on BC 25035. Attendance will be incorrect.

## Fix Recipe (NOT YET RUN)

Option A — Relink Class Assignment 288 (preferred, preserves history):
  UPDATE student_class_assignments
  SET booking_course_id = 25035,
      week_start        = '2026-08-10',
      week_end          = '2026-12-18'
  WHERE id = 288;

  UPDATE booking_courses SET active = false WHERE id = 24697;

Option B — Delete Assignment 288 + create new one on BC 25035 to class 12, weekStart 2026-08-10.

Verify after fix:
  SELECT id, booking_course_id, class_id, week_start, week_end
  FROM student_class_assignments WHERE id = 288;
  SELECT id, active FROM booking_courses WHERE id IN (24697, 25035);

## Risk
Category: bookings/class-scheduling. Reversible.
URGENT: Must be done before 09:00 Mon 10 Aug 2026.

Status: Open. NOT RUN. Last checked: 2026-08-09 UTC (133rd check)