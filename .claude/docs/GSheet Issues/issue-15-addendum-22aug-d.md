# Issue 15 Addendum 22 Aug 2026 (d) -- Holiday Ended; Saikhantes Back Today

Sheet row: 16 | Student: 1001 (Saikhantes Shagdarsuren) | Booking: 18151

## Root cause (461st check, 9th today -- Sat 22 Aug 2026 UTC)

Fresh DB read:
- Holiday 2500 (Jul 20 to Aug 21, 2026): ENDED YESTERDAY -- student returned today (Sat 22 Aug).
- Booking Course 24925 (Academic Year Afternoon): active = true, Mar 9 to Oct 2, 2026.
- Last class assignment: Student Class Assignment 255, class 11, weekStart 2026-01-12, weekEnd 2026-07-03 -- gap now 50 days.
- Booking 18151: CONFIRMED, confirmed = true, amountPaid = EUR 1,339.20.
- CRITICAL: student back today, needs class assignment before Mon 24 Aug.

## Fix recipe (NOT YET RUN)

Step 1 -- Assign class via SIS admin: Student 1001 > Booking 18151 > Booking Course 24925.
  Assign to AY Afternoon class (was class 11). weekStart = 2026-08-25, weekEnd = 2026-10-02.

Step 2 -- Verify:
  SELECT id, booking_course_id, class_id, week_start, week_end
  FROM student_class_assignment WHERE booking_course_id = 24925;

## Risk
Category: bookings / attendance. Reversible. Single student.
Time-sensitive: Mon 24 Aug 2026 (2 days).

## Status
OPEN -- fix NOT YET RUN.
Last checked: Sat 22 Aug 2026 UTC (461st, 9th today)