# Issue 38 Addendum 12 Aug 2026 vi (140th check) — CRITICAL LAST CHANCE

Reporter: PG  Area: Booking / Class  Sheet row: 40

## Symptom
BC 25043 (General English PM, 10-14 Aug 2026) has 0 class assignments.
Course ends Fri 14 Aug 2026.

## Root Cause (140th check — unchanged)
- Booking Course 25043: student 14602 (Eduardo Roche Diaz), booking 18265
- No class assignment ever inserted
- DB confirmed Wed 12 Aug 2026 UTC ~21:00: classAssignments = 0
- Booking 18265: CONFIRMED, confirmed = true, EUR 126 paid, EUR 0 open

## Days Lost / Remaining
- Mon 10 Aug: lost; Tue 11 Aug: lost; Wed 12 Aug: lost (today)
- Thu 13 Aug: tomorrow — last real chance to attend 2 days
- Fri 14 Aug: course ends — FIX MOOT AFTER THIS DATE
Total: 3 of 5 school days lost. 2 remain.

## Fix Recipe — NOT YET RUN

Option A (SIS admin UI):
Student 14602 > Booking 18265 > Booking Course 25043
> assign class 6 (B2+C1 PM), weekStart 2026-08-10, weekEnd 2026-08-14

Option B (direct DB insert, NOT YET RUN):
INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
VALUES (25043, 14602, 6, '2026-08-10', '2026-08-14');

Class 6 (B2&C1 PM) already has SCAs for other students from Aug 10.
After inserting: mark retroactive attendance Mon-Wed + Thu/Fri via SIS attendance UI.

## Risk
Category: bookings/attendance. Reversible. Blast radius: 1 student, 1 week.
URGENCY: CRITICAL. After Friday 14 Aug, attendance records permanently missing.

## Status
Fix NOT RUN. 140 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC ~21:00 (140th check)