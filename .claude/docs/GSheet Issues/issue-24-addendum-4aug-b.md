Issue 24 - Alberto Squillace: SCA Overdue (52nd check Tue 4 Aug 2026 UTC)
Reporter: | Area: Booking | Sheet row: 25

Root Cause (fresh 2026-08-04 UTC)
- Student 1052 (Alberto Squillace), booking 1611.
- BC 1797 (Morning General, 2026-04-06 to 2026-06-26): active=true, 39 days stale, 1 SCA (cosmetic).
- BC 24686 (Morning General, 2026-07-20 to 2026-09-18): active=true, 0 SCAs, 15 days into course.
All unchanged.

Fix Recipe (NOT YET RUN)
Step 1: UPDATE booking_courses SET active=false WHERE id=1797;
Step 2: INSERT INTO student_class_assignments (booking_course_id,student_id,class_id,week_start,week_end) VALUES (24686,1052,<class_id>,2026-07-20,2026-09-18);
  Confirm Morning General class with academic staff.
Step 3: Verify SCA created for BC 24686.

Risk: bookings, data-hygiene | Reversible: yes | student 1052 only.

Status: NOT YET RUN | Last checked: 2026-08-04 UTC (52nd check)