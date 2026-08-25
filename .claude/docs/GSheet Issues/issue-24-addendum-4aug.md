# Issue 24 - Alberto Squillace: Missing SCA + Stale BC (51st check Tue 4 Aug 2026 UTC)
Reporter: AC | Area: Booking | Sheet row: 25

## Root Cause (fresh - 2026-08-04 UTC)
- Student: Alberto Squillace (ID 1052), booking 1611
- BC 1797 (Morning General, Apr 6 - Jun 26 2026): active=true, 39 days stale, 1 old SCA
- BC 24686 (Morning General, Jul 20 - Sep 18 2026): active=true, 0 SCAs, 15 days since start

## Fix Recipe (NOT YET RUN)

Step 1 - Deactivate stale BC 1797:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 1797;

Step 2 - Check Alberto level:
  SELECT current_level FROM students WHERE id = 1052;

Step 3 - Create SCA on BC 24686 (staff confirm class_id):
  SELECT id, name, level, session FROM classes WHERE active = true ORDER BY level, name;
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES (24686, 1052, <class_id>, '2026-07-20', '2026-09-18');

Step 4 - Verify:
  SELECT id, active FROM booking_courses WHERE booking_id = 1611;
  SELECT id, class_id, week_start FROM student_class_assignments WHERE booking_course_id = 24686;

## Risk
Category: bookings | Reversible: yes | Blast: student 1052 (Alberto Squillace) only

## Status: NOT RUN. Last checked: 2026-08-04 UTC