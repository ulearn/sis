# Issue 22 Addendum Wed 22 Jul 2026 run k

Reporter: AC | Sheet row 23

## Root cause
BC24991 (Edith Nunes, student 1015, booking 18214): General English AM, 13 Jul to 7 Aug 2026.
Fresh DB 22 Jul 2026 UTC: 0 class assignments.
9 school days missed (Mon 13 Jul through Wed 22 Jul inclusive).
12 school days remaining (Thu 23 Jul to Fri 7 Aug), or 11 if Aug BH 3 Aug added (Issue 38).

## Fix recipe (NOT YET RUN)
1. SIS -> Booking 18214 (Edith Nunes) -> BC24991 -> assign General English AM class immediately.
2. Verify: SELECT * FROM class_assignments WHERE booking_course_id = 24991;

## Risk
Bookings, operational, reversible, blast radius 1 student.

## Status
OPEN 53rd hourly check 76th total. Fix NOT RUN.
Last checked: Wed 22 Jul 2026 UTC
