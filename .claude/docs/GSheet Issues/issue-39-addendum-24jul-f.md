Issue 39 -- Xuezhen Huang: No Class Assignment -- Addendum 24 Jul (f)

Reporter: ST | Area: Booking / Accomm | Sheet row: 41
Checked: Fri 24 Jul 2026 UTC -- 76th hourly check, 154th total run

SYMPTOM
Student paid for 3 weeks Host Family accommodation but no class assignment exists in SIS.

ROOT CAUSE (confirmed, unchanged)
Booking course 24609 (Morning General, booking 17831, student 14443) has active = true but zero classAssignments. Class assignment step was never performed. 10 school days lost.

CURRENT STATUS - FINAL WEEK, LAST CHANCE MON 27 JUL

- Booking 17831: CONFIRMED, fully paid EUR 1,396.90
- Course 24609: Morning General, 13 Jul - 31 Jul 2026, active = true, classAssignments = 0
- Accommodation 11358: bed 180, Host Family, 12 Jul - 2 Aug 2026, EUR 900, active = true
- School days missed: Mon 13 Jul - Fri 24 Jul 2026 = 10 school days
- School days remaining: Mon 27 - Fri 31 Jul 2026 = 5 school days
- Course ends: Fri 31 Jul 2026
- Mon 27 Jul 2026 is the ABSOLUTE LAST DATE to assign this student to a class -- 3 days from now

FIX RECIPE (NOT YET RUN)

Step 1: Find available Morning General class at level B2 running Mon 27 - Fri 31 Jul 2026 in SIS admin.

Step 2: Create StudentClassAssignment via SIS admin: Booking 17831 -> Course 24609 -> Assign to class.

OR via DB (confirm class id first):
  INSERT INTO student_class_assignments (booking_course_id, class_id, created_at, updated_at)
  VALUES (24609, <class_id>, NOW(), NOW());

Step 3 - Confirm:
  SELECT * FROM student_class_assignments WHERE booking_course_id = 24609;

RISK
- Category: bookings / attendance
- Reversible: Yes (delete SCA if wrong class)
- Blast radius: Single student; 5 school days recoverable if done Mon 27 Jul

STATUS
CRITICAL - FINAL WEEK - Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC
