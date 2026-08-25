# Issue 39 addendum 23jul-e — Xuezhen Huang: BC24609 still unassigned, 6 days left
Addendum: 66th hourly check Thu 23 Jul 2026 UTC (142nd total)
Reporter: KC | Area: Booking / Accomm | Sheet row 41

## Symptom
Xuezhen Huang paid for accommodation but not appearing in accommodation section for allocation. Booking course also unassigned.

## Root cause (confirmed this check — fresh DB)
- Booking course 24609 (Xuezhen Huang, student 14443): Morning General, 13 Jul to 31 Jul 2026
- Class assignments: 0 — UNCHANGED
- 6 school days remaining: Fri 24, Mon 27, Tue 28, Wed 29, Thu 30, Fri 31 Jul 2026
- No change from previous check (65th hourly, 141st total)

## Fix recipe (NOT YET RUN)
SIS Admin -> Student 14443 (Xuezhen Huang) -> Booking (with BC24609) -> Courses
-> Assign BC24609 to a Morning General class

## Risk / category
bookings / attendance; reversible. Single student. 6 school days remain (course ends Jul 31).

## Status: OPEN — 6 school days left
Last checked: Thu 23 Jul 2026 UTC (66th hourly / 142nd total)
