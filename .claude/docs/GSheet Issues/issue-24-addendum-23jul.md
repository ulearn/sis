# Issue 24 Addendum Thu 23 Jul 2026

Reporter: PG | Area: Booking | Sheet row 25 | 47th hourly check (123rd total)

## Root Cause

- Alberto Squillace (student 1052, booking 1611)
- Booking 1611: CONFIRMED, amountTotal = EUR 1280.12, amountOpen = EUR 0 (fully paid), deal 494814774510
- Booking course 24686 (Morning General, 20 Jul - 18 Sep 2026, 9 weeks, 15 h/wk): fee = null, 0 class assignments
- Day 4 of course (started Mon 20 Jul). UNCHANGED.

Prior course BC1797 (Morning General, Apr 6 - Jun 26 2026, 12 wks, fee = EUR 1836): student was in class 12 (B1 AM 2), SCA ran Apr 6 - Apr 26 only.

Note: Booking total (EUR 1280.12) is less than BC1797 fee alone (EUR 1836) — deal total set independently. Estimated fee for BC24686 at same rate: EUR 1377 (9wks x EUR 153/wk). Verify against HubSpot deal 494814774510.

## Fix Recipe (NOT YET RUN)

1. Set fee on BC24686:
   SIS Admin -> Booking 1611 -> Courses -> BC24686 -> Edit -> fee field.
   Reference: EUR 1377 (9wks x 153/wk from BC1797) — verify against HubSpot deal first.

2. Assign BC24686 to class:
   SIS Admin -> Booking 1611 -> BC24686 -> Assign to Class.
   Suggested class: B1 AM 2 (class 12) — same as BC1797 prior assignment.
   Week start: 2026-07-20, week end: 2026-09-18.

3. Verify:
   SELECT fee FROM booking_courses WHERE id = 24686;
   SELECT * FROM student_class_assignments WHERE booking_course_id = 24686;

## Risk

Reversible. Blast radius: 1 student, 1 course.
Category: bookings / financial (fee null blocks invoicing and certs).

## Status

OPEN — Day 4. 47th hourly check (123rd total). Fix NOT RUN.
Last checked: Thu 23 Jul 2026 UTC