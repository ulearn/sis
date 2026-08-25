Issue 38 — Eduardo Roche Diaz — 151st check Thu 13 Aug 2026 UTC

Reporter: AC  Area: Bookings/Class  Sheet row: 40

SYMPTOM: BC 25043 (General English PM) started Mon 10 Aug with 0 class assignments. Course ends TOMORROW Fri 14 Aug.

ROOT CAUSE (verified live):
- Booking Course 25043: name=General English PM, startDate=2026-08-10, endDate=2026-08-14, active=true, classAssignments=0
- Student 14602 (Eduardo Roche Diaz), Booking 18265: status=CONFIRMED, confirmed=true, EUR 126 paid, EUR 0 open
- Class 6 (B2/C1 PM, 13:45-17:00, days Mon-Fri): active=true, confirmed available
- Mon 10-Thu 13 Aug permanently lost (4 school days). Fri 14 Aug is the last and only recoverable day.
- No class assignment has existed on BC 25043 at any point — genuine omission, not a sync lag.

FIX RECIPE (NOT YET RUN):
Step 1 - Confirm Eduardo's level is B2/C1 (Class 6 PM). Prior checks confirm Class 6.
Step 2 - Insert student class assignment:
         INSERT INTO student_class_assignments
           (booking_course_id, class_id, week_start, week_end, student_id, created_at, updated_at)
         VALUES (25043, 6, '2026-08-10', '2026-08-14', 14602, NOW(), NOW());
Step 3 - Verify:
         SELECT id, booking_course_id, class_id, week_start, week_end, student_id
         FROM student_class_assignments WHERE booking_course_id = 25043;
Step 4 - Check Eduardo appears in Class 6 PM attendance sheet for Fri 14 Aug.

RISK: bookings/attendance | Reversible: yes (DELETE the SCA row) | Blast: 1 student, 1 day
STATUS: OPEN. 151st check. COURSE ENDS TOMORROW FRI 14 AUG. Fix NOT RUN. Run before morning of 14 Aug 2026.
