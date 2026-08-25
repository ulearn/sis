Issue 38 - Eduardo Roche Diaz - 150th check Thu 13 Aug 2026 UTC

Reporter: AC  Area: Booking/Accomm  Sheet row: 40

SYMPTOM: BC 25043 (General English PM) started 10 Aug with 0 SCAs. Ends TOMORROW Fri 14 Aug.

ROOT CAUSE (verified live):
- BC 25043: startDate=2026-08-10, endDate=2026-08-14, active=true, SCAs=0
- Student 14602 (Eduardo Roche Diaz), Booking 18265: CONFIRMED, EUR 126 paid, EUR 0 open
- Mon 10-Thu 13 Aug permanently lost. Fri 14 Aug still recoverable if fix runs before class.

FIX RECIPE (NOT YET RUN):
Step 1 - Confirm Eduardo level (PM classes: 6=B2/C1, 9=A2, 11=B1, 14=C1). Prior recipe suggests 6.
Step 2 - INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end, student_id, created_at)
         VALUES (25043, 6, '2026-08-10', '2026-08-14', 14602, NOW());
Step 3 - Verify: SELECT * FROM student_class_assignments WHERE booking_course_id=25043;

RISK: bookings/attendance | Reversible: yes | Blast: 1 student 1 week
STATUS: OPEN. 150th check. FINAL CHANCE. Fix NOT RUN.