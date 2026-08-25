Issue 15 addendum 15 Aug 2026 UTC 124th check

Reporter: KC/TB | Area: Booking/Class | Sheet row: 16

ROOT CAUSE (124th check)
- Student 1001 (Saikhantes Shagdarsuren), booking 18151: CONFIRMED, fully paid EUR 1,339.20
- serviceEnd = Aug 7 2026 -- expired 8 days ago, course continues to Oct 2 2026
- Booking Course 24925 (Academic Year Afternoon, Mar 9 - Oct 2 2026): active = true
- Student Class Assignment 255 (class 11): weekEnd = Jul 3 2026 -- 43 days expired, no newer SCA
- Holiday 2500: Jul 20 - Aug 21 2026 -- STUDENT RETURNS IN 6 DAYS (Thu Aug 21)
- No change from 123rd check (earlier Sat 15 Aug UTC)

FIX RECIPE (NOT YET RUN)
1. Confirm with KC/TB: is student still attending class 11 from Aug 21?
2a. If yes (expected):
    UPDATE bookings SET service_end = 2026-10-02 WHERE id = 18151; -- NOT YET RUN
    INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
      VALUES (24925, 11, 2026-08-24, 2026-10-02); -- NOT YET RUN (week_start = Mon after return)
2b. If finished: deactivate BC 24925 and set serviceEnd to actual leave date

RISK: reversible, single student. Must act before Aug 21 return (Thu) - without an SCA she
      cannot be marked in attendance and will not appear in the class list.
STATUS: OPEN. Last checked: 15 Aug 2026 UTC (124th check / 295th run)