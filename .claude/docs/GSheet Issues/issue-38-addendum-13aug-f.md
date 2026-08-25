Issue 38 - Eduardo Roche Diaz - 149th check Thu 13 Aug 2026 UTC

SYMPTOM: BC 25043 (General English PM) started 10 Aug with 0 SCAs. Ends TOMORROW Fri 14 Aug.

ROOT CAUSE: No SCA ever added to BC 25043. Mon 10-Thu 13 Aug permanently lost.
Only Fri 14 Aug recoverable. Fix must run before class starts Friday morning.

EVIDENCE (DB 2026-08-13):
- BC 25043: startDate=2026-08-10, endDate=2026-08-14, active=true, SCAs=0
- Booking 18265: CONFIRMED, EUR 126 paid, EUR 0 open

FIX RECIPE (NOT YET RUN):
1. Confirm PM class for Eduardo (likely class 6 B2/C1 PM)
2. Add SCA: INSERT INTO student_class_assignment (booking_course_id, class_id, week_start, week_end, created_at, updated_at) VALUES (25043, 6, 2026-08-10, 2026-08-14, NOW(), NOW());
3. Verify: SELECT * FROM student_class_assignment WHERE booking_course_id = 25043;

RISK: bookings/attendance | Reversible: yes | Blast: 1 student, 1 week
STATUS: OPEN. 149th check. FINAL CHANCE. Fix NOT RUN.