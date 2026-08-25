Issue 24 -- Alberto Squillace: No Class Assignment + Fee Null -- Addendum 24 Jul (b)

Reporter: (bot) | Area: Booking / Accomm | Sheet row: 25
Checked: Fri 24 Jul 2026 UTC -- 57th hourly check, 156th total run

ROOT CAUSE (confirmed, unchanged): Class assignment never performed on booking course 24686; fee not set.

CURRENT STATUS -- UNCHANGED, WEEK 1 COMPLETE (5 SCHOOL DAYS MISSED)

- Course 24686: Morning General, 20 Jul - 18 Sep 2026, active = true, classAssignments = 0, fee = null
- School days missed: Mon 20 Jul - Fri 24 Jul 2026 = 5 days (first full week, irrecoverable)
- School days remaining: approx 38 through 18 Sep 2026 (adjust for Issue 38 Aug BH)

FIX RECIPE (NOT YET RUN)

Step 1 - Confirm student:
  SELECT s.id, s.first_name, s.last_name FROM students s JOIN bookings b ON b.student_id = s.id WHERE b.id = 1611;

Step 2 - Set fee: UPDATE booking_courses SET fee = <correct_fee> WHERE id = 24686;

Step 3 - Assign class from Mon 27 Jul in SIS admin.

OR via DB:
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, created_at)
  VALUES (24686, <student_id>, <class_id>, '2026-07-27', NOW());

Confirm:
  SELECT fee FROM booking_courses WHERE id = 24686;
  SELECT * FROM student_class_assignments WHERE booking_course_id = 24686;

RISK: bookings/attendance/money | Reversible: Yes | Single student | 38 days still recoverable

STATUS: Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC