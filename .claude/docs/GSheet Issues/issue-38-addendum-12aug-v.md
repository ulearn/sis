# Issue 38 Addendum 12 Aug 2026 v (139th check) — CRITICAL LAST CHANCE

Reporter: PG  Area: Booking / Class  Sheet row: 40

## Symptom
BC 25043 (General English PM, 10-14 Aug 2026) has 0 class assignments.
Course ends Fri 14 Aug 2026.

## Root Cause (139th check)
- Booking Course 25043: student 14602 (Eduardo Roche Diaz), booking 18265
- No class assignment ever inserted
- DB confirmed Wed 12 Aug 2026 UTC ~20:00: classAssignments = 0

## Days Lost / Remaining
- Mon 10 Aug: lost; Tue 11 Aug: lost; Wed 12 Aug: lost (today)
- Thu 13 Aug: TOMORROW — last real chance
- Fri 14 Aug: course ends
Total: 3 of 5 school days lost. 2 remain. FIX MOOT AFTER FRI 14 AUG.

## Fix Recipe — NOT YET RUN

Option A (SIS admin UI):
Student 14602 > Booking 18265 > Booking Course 25043
> assign class 6 (B2+C1 PM), weekStart 2026-08-10, weekEnd 2026-08-14

Option B (direct DB insert, NOT YET RUN):
INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
VALUES (25043, 14602, 6, '2026-08-10', '2026-08-14');

After inserting: mark retroactive attendance Mon-Wed + Thu/Fri via SIS attendance UI.

## Risk
Category: bookings/attendance. Reversible. Blast radius: 1 student, 1 week.
URGENCY: CRITICAL. After Friday 14 Aug, attendance records permanently missing.

## Status
Fix NOT RUN. 139 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC ~20:00 (139th check)