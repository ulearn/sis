# Issue 39 Addendum 22 Jul 2026 g
Reporter: KC | Area: Booking / Accomm + Class | Sheet row: 41
Student: Xuezhen Huang (ID 14443, booking 17831)
Last checked: Wed 22 Jul 2026 UTC (46th hourly, 71st total)

## Accommodation status
BA11358: Host Family, Individual room, bed 180, 3 weeks, 12 Jul to 2 Aug 2026, EUR 900, active=true
ACCOMMODATION IS PRESENT IN DB AND BED ASSIGNED — original display issue appears resolved.

## Class assignment status
BC24609: Morning General, 13 Jul to 31 Jul 2026 — STILL zero class assignments
School days missed: 7 (13-22 Jul) | School days remaining: 6 (23-31 Jul)

## Fix Recipe (NOT YET RUN)
Assign BC24609 to a Morning General class via SIS admin:
  Booking 17831 > Courses tab > BC24609 > Class Assignment
  Start date: 23 Jul 2026 (retroactive assignments not needed at this stage)

## Risk
Category: bookings / class assignment | Reversible: yes | Blast radius: single student
Urgency: 6 school days left (ends 31 Jul) — assign this week

## Note
Accommodation issue (original report) appears resolved via BA11358.
Remaining issue is class assignment only — tracked also in issue 45 (BC24609).

## Previous recipe: issue-39-addendum-22jul-f.md