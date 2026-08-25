# Issue 45 Addendum Wed 22 Jul 2026 run o

Reporter: AC | Sheet row 47

## Root cause
BC24828 (Martina Tartaro, booking 18036): Morning General Plus + IELTS, ends 24 Jul 2026, 0 class assignments.
BC25011 (Eduardo Roche Diaz, booking 18233): General English PM, 20-24 Jul 2026, EUR 120, 0 class assignments.
Fresh DB 22 Jul 2026 UTC: both CAs = 0.

## Urgency
LAST CHANCE. Courses end Fri 24 Jul (2 school days: Thu 23 + Fri 24). Must act today.

## Fix recipe (NOT YET RUN)
1. SIS -> Booking 18036 -> BC24828 -> assign Morning General Plus/IELTS class for Thu 23 + Fri 24 Jul.
2. SIS -> Booking 18233 -> BC25011 -> assign General English PM class for Thu 23 + Fri 24 Jul.
3. Verify: SELECT * FROM class_assignments WHERE booking_course_id IN (24828, 25011);

## Risk
Bookings, operational, reversible, blast radius 2 students.

## Status
OPEN 56th hourly check 88th total. Fix NOT RUN.
Last checked: Wed 22 Jul 2026 UTC
