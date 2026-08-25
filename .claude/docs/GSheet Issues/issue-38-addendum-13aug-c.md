Issue 38 Addendum 13 Aug 2026 (145th check) -- LAST CALL

Reporter: PG  Area: Booking / Class  Sheet row: 40

Root Cause (145th check -- Thu 13 Aug UTC)
- Booking Course 25043: student 14602 (Eduardo Roche Diaz), booking 18265
- classAssignments = [] -- no assignment ever made
- Booking 18265: CONFIRMED, EUR 126 paid, EUR 0 open
- endDate: 2026-08-14 -- TOMORROW (Fri 14 Aug)

Days lost: Mon-Thu (4 days permanently lost). Only Fri 14 Aug still recoverable.

Fix recipe -- NOT YET RUN
Option A (SIS admin UI): Student 14602 > Booking 18265 > BC 25043 > Assign class 6 (PM), wk 10-14 Aug
Option B (DB): INSERT INTO student_class_assignment (booking_course_id,student_id,class_id,weekStart,weekEnd) VALUES (25043,14602,6,chr(39)||2026-08-10||chr(39),chr(39)||2026-08-14||chr(39));

Risk: bookings/attendance. Reversible. Blast: 1 student. CRITICAL.
Status: Fix NOT RUN. 145 consecutive checks. Last checked: Thu 13 Aug 2026 UTC