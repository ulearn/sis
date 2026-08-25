# Issue 38 Addendum 12 Aug 2026 iv (138th check) — LAST CHANCE

Reporter: PG  Area: Booking / Class  Sheet row: 40

## Symptom
BC 25043 (General English PM, 10-14 Aug 2026) has 0 class assignments.
Course ends Fri 14 Aug 2026.

## Root Cause (138th check — FINAL OPPORTUNITY)
- Booking Course 25043: student 14602 (Eduardo Roche Diaz), booking 18265
- No student class assignment ever inserted
- DB confirmed Wed 12 Aug 2026 UTC ~19:00: classAssignments count = 0
- Booking 18265: CONFIRMED, confirmed = true, payment 18086 = EUR 126

## Days Lost / Remaining
- Mon 10 Aug 2026: 0 attendance recorded (lost)
- Tue 11 Aug 2026: 0 attendance recorded (lost)
- Wed 12 Aug 2026: 0 attendance recorded (today, lost)
- Thu 13 Aug 2026: 1 day remaining (TOMORROW - last real chance)
- Fri 14 Aug 2026: 1 day remaining (course end)
Total: 3 of 5 school days lost. 2 remain. AFTER FRIDAY THIS FIX IS MOOT.

## Fix Recipe — NOT YET RUN

Option A (SIS admin UI):
Student 14602 > Booking 18265 > Booking Course 25043
> assign class 6 (B2+C1 PM), weekStart 2026-08-10

Option B (direct DB insert, NOT YET RUN):
INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
VALUES (25043, 14602, 6, 2026-08-10, 2026-08-14);

After inserting: mark retroactive attendance (Mon-Wed) + Thu/Fri via SIS attendance UI for class 6.

## Risk / Category
- Category: bookings / attendance
- Reversible: yes (delete the SCA if wrong)
- Blast radius: 1 student, 1 week
- URGENCY: CRITICAL. After Friday 14 Aug, attendance records permanently missing.

## Status
Fix NOT RUN. 138 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC ~19:00 (138th check)