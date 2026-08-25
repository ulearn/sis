Issue 39 -- Xuezhen Huang: No Class Assignment -- Addendum 24 Jul (g)

Reporter: KC | Area: Booking / Accomm | Sheet row: 41
Checked: Fri 24 Jul 2026 UTC -- 78th hourly check, 156th total run

SYMPTOM
Student paid 3 weeks Host Family accommodation; zero class assignments in SIS.

ROOT CAUSE (confirmed, unchanged)
Booking course 24609 (Morning General, booking 17831, student 14443) active = true, classAssignments = 0. Class assignment never performed.

CURRENT STATUS -- FINAL WEEK: MON 27 JUL IS LAST PRACTICAL DATE (3 calendar days)

- Booking 17831: CONFIRMED, fully paid EUR 1,396.90, amount open = EUR 0
- Course 24609: Morning General, 13 Jul - 31 Jul 2026, active = true, classAssignments = 0
- Accommodation 11358: bed 180, Host Family, 12 Jul - 2 Aug 2026, active = true
- School days missed: Mon 13 Jul - Fri 24 Jul 2026 = 10 school days (irrecoverable)
- School days remaining: Mon 27 - Fri 31 Jul 2026 = 5 school days
- Mon 27 Jul 2026 is the last Monday of the course; last practical assignment date

FIX RECIPE (NOT YET RUN)

Step 1: Find available Morning General class, Mon 27 - Fri 31 Jul 2026, in SIS admin.

Step 2: Create StudentClassAssignment via SIS admin: Booking 17831 -> Course 24609 -> class.

OR via DB:
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, created_at)
  VALUES (24609, 14443, <class_id>, '2026-07-27', NOW());

Step 3 - Confirm:
  SELECT * FROM student_class_assignments WHERE booking_course_id = 24609;

RISK: bookings/attendance | Reversible: Yes | Single student | 5 days recoverable Mon 27 Jul only

STATUS: CRITICAL - FINAL WEEK - Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC