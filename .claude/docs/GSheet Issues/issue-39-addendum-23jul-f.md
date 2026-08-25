Issue 39 addendum 23jul-f — Xuezhen Huang: BC24609 still unassigned, 6 school days left
Addendum: 67th hourly check Thu 23 Jul 2026 UTC (143rd total)
Reporter: KC | Area: Booking / Class | Sheet row 41

Symptom
Xuezhen Huang (student 14443) booking course 24609 has zero class assignments. Course ends 31 Jul 2026.

Root cause (confirmed this check — fresh DB)
- Booking course 24609: Morning General, 13 Jul to 31 Jul 2026, booking 17831, student 14443
- Class assignments: 0 — UNCHANGED
- 9 school days already missed (13-23 Jul)
- 6 school days remaining: Fri 24, Mon 27, Tue 28, Wed 29, Thu 30, Fri 31 Jul
- Booking 17831: Confirmed, confirmed = true, fully paid EUR 1,396.90
- No change from 66th check (142nd total)

Fix recipe (NOT YET RUN)
SIS Admin -> Student 14443 (Xuezhen Huang) -> Booking 17831 -> Courses -> BC24609
-> Assign to a Morning General class (check availability for appropriate level)

OR: Classes -> Morning General class -> Add student -> select BC24609

Risk / category
bookings / class assignment; reversible. Single student. Blast radius: low.
Course ends 31 Jul 2026 — 6 school days remaining.

Status: OPEN — 6 school days left (course ends 31 Jul 2026)
Last checked: Thu 23 Jul 2026 UTC (67th hourly / 143rd total)