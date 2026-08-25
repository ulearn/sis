# Issue 39 — Xuezhen Huang BC24609 unassigned — Addendum 21 Jul 2026

Reporter: KC | Area: Booking / Accomm | Sheet row: 41

## Root cause (47th check, Tue 21 Jul 2026 UTC)

BC24609 (Xuezhen Huang, Morning General, 13 Jul - 31 Jul 2026):
- Booking 17831, student 14443, fee = EUR 570, active = true
- classAssignments = 0
- Week 2 day 2: 6 school days missed (Jul 13-17 + Jul 20), 9 remaining (Jul 21-24, Jul 27-31)

Accommodation BA11357 (bed 178, Host Family, 2 Aug - 6 Sep 2026): unaffected.

## Fix recipe (NOT YET RUN)

Assign Xuezhen to Morning General class:
SIS -> Student 14443 -> Booking 17831 -> BC24609 -> Assign Class

## Risk
bookings / class assignment — low blast radius, reversible.
CRITICAL — 6 days missed; course ends 31 Jul (9 remaining).

Open — Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC