# Issue 39 Addendum Wed 22 Jul 2026 run m

Reporter: staff | Sheet row 41

## Root cause
BC24609 (Xuezhen Huang, student 14443): Morning General, 13 Jul to 31 Jul 2026.
Fresh DB 22 Jul 2026 UTC: 0 class assignments.
7 school days remaining (Thu 23 Jul to Fri 31 Jul).
Accommodation BA11358 (bed 180, Host Family, 12 Jul to 2 Aug 2026) is active and correct.

## Fix recipe (NOT YET RUN)
1. SIS -> Booking (student 14443) -> BC24609 -> assign to a Morning General class.
2. Verify: SELECT * FROM class_assignments WHERE booking_course_id = 24609;

## Risk
Bookings, operational, reversible, blast radius 1 student.

## Status
OPEN 56th hourly check 81st total. Fix NOT RUN.
Last checked: Wed 22 Jul 2026 UTC
