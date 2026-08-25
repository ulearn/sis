# Issue 12 Addendum 11 Aug 2026-d (160th check)

Tue 11 Aug 2026 UTC. No change since 159th check.

## Current State (DB confirmed this run)

- Booking Course 25035 (Rakan Alghamdi, student 14444): General English Academic Year AM Plus
  3 Aug - 18 Dec 2026, active = true, 0 class assignments -- CONFIRMED via direct DB query
  7 school days unrecorded (Aug 3-7 + Aug 10-11)
- Student Class Assignment 288: class 12 (B1 AM (2)), on BC 24697 (ended 31 Jul 2026)
  weekEnd = 2026-12-18 -- SCA weekEnd extends well past BC 24697 actual end
- Booking 17915: CONFIRMED, fully paid EUR 9,138.75, EUR 0 open

## Impact

- Attendance since 3 Aug is attributed to ended BC 24697, not to active BC 25035
- ILEP compliance checks on BC 25035 show 0 attendance for the new period
- SCA 288 weekEnd (Dec 18) extends past BC 24697 end (Jul 31) -- data anomaly

## Fix Recipe (NOT YET RUN)

Step 1 -- Create SCA for active BC 25035:
  Option A: SIS admin -> student 14444 -> BC 25035 -> Assign class 12 (B1 AM (2)),
  weekStart=2026-08-03, weekEnd=2026-12-18

  Option B -- DB insert (NOT YET RUN):
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (25035, 12, '2026-08-03', '2026-12-18'); -- NOT YET RUN

Step 2 -- Correct SCA 288 weekEnd to match BC 24697 actual end date:
  UPDATE student_class_assignments SET week_end = '2026-07-31' WHERE id = 288; -- NOT YET RUN

Step 3 -- Verify attendance attribution:
  Check attendance records from 3 Aug onwards are linked to BC 25035 (not 24697).
  If using booking_course_id on attendance table, those entries may need re-linking.

## Risk / Category
- Category: bookings / attendance
- Reversible: yes -- delete inserted SCA or revert weekEnd if wrong
- Blast radius: single student; 7 school days mis-attributed attendance

Status: Open. Fix NOT YET RUN.
Last checked: Tue 11 Aug 2026 UTC (160th check)