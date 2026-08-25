# Issue 45 addendum 23jul-f — Eduardo Roche: EXPIRES TOMORROW — final check
Addendum: 68th hourly check Thu 23 Jul 2026 UTC (142nd total)
Reporter: AC | Area: Renewal students | Sheet row 47

## Symptom
Eduardo Roche Diaz (student 14602) booking course 25011 has zero class assignments. Course expires TOMORROW Fri 24 Jul 2026.

## Root cause (confirmed this check — fresh DB)
- Booking course 25011: General English PM, 20-24 Jul 2026, booking 18233, student 14602
- Class assignments: 0 — UNCHANGED
- 4 school days already lost: Mon 20, Tue 21, Wed 22, Thu 23 Jul
- 1 school day remaining: Fri 24 Jul only
- Booking 18233: confirmed = true, fully paid EUR 178.50 / 178.50
- No changes since last check (67th hourly, 141st total)

## Fix recipe (NOT YET RUN)
Must be done before end of Fri 24 Jul 2026 — after that the attendance window closes permanently.

SIS Admin -> Student 14602 (Eduardo Roche Diaz) -> Booking 18233 -> Courses -> BC25011
-> Assign to Class 6 (B2&C1 PM General English)

OR: Classes -> Class 6 -> Add student manually for week of Jul 20-24 -> select BC25011

## Risk / category
bookings / attendance; reversible. Single student. Blast radius: low.
Time window closes: end of Fri 24 Jul 2026.

## Status: OPEN — EXPIRES TOMORROW Fri 24 Jul 2026 — FINAL CHANCE
Last checked: Thu 23 Jul 2026 UTC (68th hourly / 142nd total)
