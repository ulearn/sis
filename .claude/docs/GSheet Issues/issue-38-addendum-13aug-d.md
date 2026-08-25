Issue 38 Addendum 13 Aug 2026 (147th check) -- ABSOLUTE FINAL

Reporter: PG  Area: Booking / Class  Sheet row: 40

Root Cause (147th check -- Thu 13 Aug UTC, 237th hourly run)
- Booking Course 25043: student 14602 (Eduardo Roche Diaz), booking 18265
- classAssignments = [] -- no assignment ever made (147 consecutive checks)
- Booking 18265: CONFIRMED, EUR 126 paid, EUR 0 open
- endDate: 2026-08-14 -- TOMORROW (Fri 14 Aug) -- final day of term

Days lost: Mon-Thu (4 days permanently unrecoverable).
ONLY Fri 14 Aug is still recoverable -- fix must happen before class starts Friday morning.

Fix recipe -- NOT YET RUN
Option A (SIS admin UI):
  Student 14602 > Booking 18265 > BC 25043 > Assign class 6 (B2/C1 PM), wk 10-14 Aug

Option B (DB -- NOT YET RUN):
  INSERT INTO student_class_assignment
    (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES
    (25043, 14602, 6, chr(39)||2026-08-10||chr(39), chr(39)||2026-08-14||chr(39));

  Then verify: SELECT * FROM student_class_assignment WHERE booking_course_id = 25043;

Risk: bookings/attendance. Reversible. Blast radius: 1 student. CRITICAL -- last opportunity.
Status: Fix NOT RUN. 147 consecutive checks. Last checked: Thu 13 Aug 2026 UTC
