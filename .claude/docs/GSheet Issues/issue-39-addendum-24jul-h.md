Issue 39 -- Xuezhen Huang: No Class Assignment -- Addendum 24 Jul (h)

Reporter: KC | Area: Booking / Accomm | Sheet row: 41
Checked: Fri 24 Jul 2026 UTC -- 81st hourly check, 159th total run

SYMPTOM
Student paid 3 weeks Host Family accommodation; zero class assignments in SIS.

ROOT CAUSE (confirmed, unchanged)
Booking course 24609 (Morning General, booking 17831, student 14443) active = true, classAssignments = 0.

CORRECTION TO PRIOR RECIPE
Previous recipes stated Mon 27 Jul IS THE LAST PRACTICAL DATE -- WRONG.
July 27 2026 is a SUNDAY. Correct dates:
- Fri 25 Jul (TOMORROW) -- last chance for 5-day recovery
- Mon 28 Jul -- first day of final week, 4 school days remaining
- Thu 31 Jul -- course ends

CURRENT STATUS -- TRULY FINAL WEEK
- Booking 17831: CONFIRMED, fully paid EUR 1,396.90
- Course 24609: Morning General, 13 Jul - 31 Jul 2026, active = true, classAssignments = 0
- Accommodation 11358: Host Family, 12 Jul - 2 Aug 2026, active = true
- School days missed: Mon 13 Jul - Fri 24 Jul = 10 school days (irrecoverable)
- School days remaining: Fri 25, Mon 28, Tue 29, Wed 30, Thu 31 Jul = 5 school days
- FRI 25 JUL (TOMORROW) = LAST CHANCE FOR 5-DAY RECOVERY

FIX RECIPE (NOT YET RUN)

Step 1: Find available Morning General class Fri 25 Jul - Thu 31 Jul 2026.
Step 2: Create StudentClassAssignment: Booking 17831 -> Course 24609 -> class_id, start Fri 25 Jul.
  OR via DB: INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, created_at)
  VALUES (24609, 14443, <class_id>, '2026-07-27', NOW());
Step 3 -- Confirm: SELECT * FROM student_class_assignments WHERE booking_course_id = 24609;

RISK: bookings/attendance | Reversible: Yes | CRITICAL -- course ends Thu 31 Jul
STATUS: CRITICAL -- FRI 25 TOMORROW IS LAST DAY FOR 5-DAY RECOVERY | Fix NOT Run
Last checked: Fri 24 Jul 2026 UTC