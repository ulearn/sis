Issue 22 -- Edite Nunes: No Class Assignment -- Addendum 24 Jul (f)

Reporter: PG | Area: Booking / Class | Sheet row: 23
Checked: Fri 24 Jul 2026 UTC -- 78th hourly check, 159th total run

ROOT CAUSE (confirmed, unchanged)
Booking course 24991 (General English AM, booking 18214, student 1015) active = true, classAssignments = 0.

CURRENT STATUS -- 10 DAYS MISSED, 8 EFFECTIVE DAYS REMAINING
- Student 1015: Edite Nunes (Edith in SIS)
- Course 24991: General English AM, 13 Jul - 7 Aug 2026, active = true, classAssignments = 0
- School days missed: Mon 13 Jul - Fri 24 Jul = 10 school days (irrecoverable)
- Remaining school days from Mon 28 Jul:
    Mon 28, Tue 29, Wed 30, Thu 31 Jul
    Mon 3 Aug (AUG BANK HOLIDAY -- school closed)
    Tue 4, Wed 5, Thu 6, Fri 7 Aug
  = 8 effective school days (Aug 3 not a teaching day)

NOTE -- AUG BANK HOLIDAY INTERACTION (see Issue 38 row 40)
Aug BH Mon 3 Aug 2026 is NOT in school_closures. School will be closed regardless.
Fix Issue 38 first (add the BH closure) so attendance dates are accurate.

FIX RECIPE (NOT YET RUN)

Step 0 (prerequisite): Add Aug BH to school_closures -- see Issue 38 recipe.
Step 1: Find available General English AM class Mon 28 Jul - Fri 7 Aug 2026.
Step 2: Create StudentClassAssignment: Booking 18214 -> Course 24991 -> class_id, start Mon 28 Jul.
  OR via DB: INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, created_at)
  VALUES (24991, 1015, <class_id>, '2026-07-27', NOW());
Step 3 -- Confirm: SELECT * FROM student_class_assignments WHERE booking_course_id = 24991;

RISK: bookings/attendance | Reversible: Yes | CRITICAL -- 10 days missed
STATUS: CRITICAL -- Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC