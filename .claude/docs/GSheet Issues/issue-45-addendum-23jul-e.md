# Issue 45 addendum 23jul-e — Eduardo Roche: ABSOLUTE FINAL CHECK before expiry
Addendum: 66th hourly check Thu 23 Jul 2026 UTC (140th total)
Reporter: AC | Area: Renewal students | Sheet row 47

## Symptom
Eduardo Roche Diaz (student 14602) booking course 25011 has zero class assignments. Course expires TOMORROW Fri 24 Jul 2026. This is the final hourly check before the course ends.

## Root cause (confirmed this check — fresh DB)
- Booking course 25011: General English PM, 20-24 Jul 2026, booking 18233, student 14602
- Class assignments: 0 — UNCHANGED (4 full school days lost: Mon 20, Tue 21, Wed 22, Thu 23 Jul)
- Course active = true, end date 2026-07-24
- Booking 18233: confirmed = true, fully paid EUR 178.50 / 178.50
- Booking last updated 2026-07-20; nothing since

## Fix recipe (NOT YET RUN)
MUST be done before end of Fri 24 Jul 2026 or the attendance record is permanently unrecoverable.

SIS Admin -> Student 14602 (Eduardo Roche Diaz) -> Booking 18233 -> Courses -> BC25011
-> Assign to Class 6 (B2&C1 PM General English)

OR: Classes -> Class 6 -> Add student manually for week of Jul 20-24 -> select BC25011

After Fri 24 Jul the course end-date passes; no attendance can be recorded.

## Risk / category
bookings / attendance; reversible. Single student. Blast radius: low.
Time window closes: end of Fri 24 Jul 2026.

## Status: OPEN — EXPIRES TOMORROW Fri 24 Jul 2026
Last checked: Thu 23 Jul 2026 UTC (66th hourly / 140th total)
