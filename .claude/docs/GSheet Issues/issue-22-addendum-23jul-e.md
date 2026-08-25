# Issue 22 addendum 23jul-e — Edith Nunes: 9 school days missed, 10 remaining
Addendum: 63rd hourly check Thu 23 Jul 2026 UTC (140th total)
Reporter: AC | Area: Booking / Class | Sheet row 23

## Symptom
Edith Nunes not appearing on TBA for week of 18 May 2026 — two payments same invoice?

## Root cause (confirmed this check — fresh DB)
- Booking course 24991 (Edith Nunes, student 1015, booking 18214): General English AM, 13 Jul to 7 Aug 2026
- Class assignments: 0 — UNCHANGED
- 9 school days missed: Mon 13 Jul to Thu 23 Jul 2026
- 10 school days remaining: Fri 24 Jul to Fri 7 Aug 2026 (Aug Bank Holiday 3 Aug not yet a school closure — Issue 38)
- Booking 18214: confirmed = true, amount paid EUR 608 / 608 (fully paid)

## Fix recipe (NOT YET RUN)
SIS Admin -> Student 1015 (Edith Nunes) -> Booking 18214 -> Courses -> BC24991
-> Assign to General English AM class (class 2 or appropriate AM class)

Assign for start date 13 Jul 2026 (course start). Attendance from 13-23 Jul is lost; assignment will cover remaining 10 days.

## Risk / category
bookings / class attendance; reversible. Single student. Blast radius: low.
Urgent: 10 school days left (course ends Fri 7 Aug 2026).

## Status: OPEN — 9 school days missed; 10 remaining
Last checked: Thu 23 Jul 2026 UTC (63rd hourly / 140th total)
