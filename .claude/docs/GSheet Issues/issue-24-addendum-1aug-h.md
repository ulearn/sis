# Issue 24 — Alberto Squillace Missing Class Assignment

Reporter: PG | Area: Booking | Sheet row: 25 | Check: 20th (13th Sat 1 Aug 2026 UTC)

## Symptom
Migration problem — student had holidays in Fidelo (week of Apr 27 was holiday start), new course starting
Jul 20 created in SIS but has no class assignment and no fee set.

## Root Cause (fresh DB - NOT YET FIXED)
Booking 1611 (student 1052, Alberto Squillace).

Booking course 24686: Morning General, 2026-07-20 to 2026-09-18, active=true, fee=null.
  - 0 class assignments (SCAs) as of Sat 1 Aug 2026.
  - 10 teaching weekdays elapsed since start date with no class assignment.

Booking course 1797: Morning General, 2026-04-06 to 2026-06-26, active=true, fee=1836.
  - Ended 2026-06-26 (36 days ago). Stale active=true.

Dependency: Issue 38 Aug BH shunt should be done first so Aug 3 is excluded from any new SCA.

## Fix Recipe (NOT YET RUN)

Step 1 - Confirm with Paul: which class should Alberto be in, and what is the correct fee for BC 24686?

Step 2 - Set fee on BC 24686 (NOT YET RUN):
  UPDATE booking_courses SET fee = <confirmed_fee> WHERE id = 24686;

Step 3 - Create class assignment for BC 24686 (NOT YET RUN):
  INSERT INTO student_class_assignments
    (booking_course_id, student_id, class_id, week_start, week_end, created_at)
  VALUES (24686, 1052, <class_id>, '2026-07-20', '2026-07-24', NOW());
  -- Then create assignments for subsequent weeks through end of course.

Step 4 - Deactivate stale BC 1797 (NOT YET RUN):
  UPDATE booking_courses SET active = false WHERE id = 1797;

Step 5 - Verify:
  SELECT id, name, start_date, end_date, active, fee FROM booking_courses WHERE id IN (24686, 1797);
  SELECT id, class_id, week_start FROM student_class_assignments WHERE booking_course_id = 24686;

## Risk / Category
- Category: bookings/class assignment
- Reversible: yes (DELETE the inserted SCA rows, UPDATE fee back to null)
- Blast radius: 1 student (Alberto Squillace)
- Info needed: class ID and fee confirmation from Paul

## Status
Open - 20th check (13th today Sat 1 Aug 2026). NOT FIXED.
10 weekdays elapsed since BC 24686 start. Info needed from Paul (class + fee). Blocked by Issue 38.

Last checked: 2026-08-01 UTC