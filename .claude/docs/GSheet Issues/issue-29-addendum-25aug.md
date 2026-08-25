Issue 29 & 15 -- Saikhantes Shagdarsuren Missing SCA

Reporter: Various | Area: Booking/Class | Sheet row: 30
Last checked: 2026-08-25 UTC (510th run)

ROOT CAUSE (current)
- Student 1001 (Saikhantes Shagdarsuren)
- BC24925 (Academic Year Afternoon): active=true, ends 2026-10-02 (38 DAYS REMAINING)
- Last SCA: class 11, weekEnd 2026-07-03 -- expired 53 DAYS AGO
- Student has attended class for 53 days without a valid SCA record

FIX RECIPE (NOT YET RUN)
Create a new Student Class Assignment for BC24925:
  INSERT INTO student_class_assignment (student_id, class_id, booking_course_id, week_start, week_end, active)
  VALUES (1001, 11, 24925, 2026-07-07, 2026-10-02, NULL);
Verify class 11 is still correct for Saikhantes before running.
week_start = first Monday after Jul 3 = Jul 7 2026. Adjust if on break.

RISK: Data-integrity -- student attending without SCA; affects attendance reporting. Reversible (DELETE inserted row).

STATUS: Fix NOT RUN. SCA expired 53 days ago. BC ends Oct 2 (38 days). CRITICAL.
