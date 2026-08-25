Issue 22 -- Unassigned Student (BC 24991) -- Addendum 24 Jul (e)

Reporter: (bot) | Area: Booking / Accomm | Sheet row: 23
Checked: Fri 24 Jul 2026 UTC -- 75th hourly check, 156th total run

ROOT CAUSE (confirmed, unchanged): Class assignment never performed on booking course 24991.

CURRENT STATUS -- UNCHANGED, 10 SCHOOL DAYS MISSED

- Booking 18214: CONFIRMED, EUR 608 / 608 fully paid
- Course 24991: General English AM, end 7 Aug 2026, active = true, classAssignments = 0
- School days missed: Mon 13 Jul - Fri 24 Jul 2026 = 10 days (irrecoverable)
- School days remaining: Mon 27 Jul - Fri 7 Aug 2026 = 9 days (with Aug BH Issue 38 fixed) or 10 without
- Depends on Issue 38: fix Aug Bank Holiday before or alongside this

FIX RECIPE (NOT YET RUN)

Step 1: Fix Issue 38 (insert Aug BH into school_closures).
Step 2: Find available General English AM class from Mon 27 Jul in SIS admin.
Step 3: SIS admin: Booking 18214 -> Course 24991 -> assign to class.

OR via DB:
  SELECT student_id FROM bookings WHERE id = 18214;
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, created_at)
  VALUES (24991, <student_id>, <class_id>, '2026-07-27', NOW());

Confirm: SELECT * FROM student_class_assignments WHERE booking_course_id = 24991;

RISK: bookings/attendance | Reversible: Yes | Single student | 9-10 days recoverable Mon 27 Jul

STATUS: CRITICAL - Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC