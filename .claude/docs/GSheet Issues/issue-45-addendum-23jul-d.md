# Issue 45 addendum 23jul-d — Eduardo Roche: LAST DAY Fri 24 Jul
Addendum: 63rd hourly check Thu 23 Jul 2026 UTC (137th total)
Reporter: AC | Area: Renewal students | Sheet row 47

## Symptom
Eduardo Roche (student 14602) booking course 25011 has zero class assignments. Course expires TOMORROW Fri 24 Jul 2026.

## Root cause (confirmed this check)
- Booking course 25011: General English PM, 20–24 Jul 2026, booking 18233, student 14602
- Class assignments: 0 — UNCHANGED (4 full school days lost: Mon 20, Tue 21, Wed 22, Thu 23 Jul)
- Course active = true, booking 18233 CONFIRMED, fully paid EUR 178.50/178.50
- End date: 2026-07-24 (Fri) — 1 school day remaining
- Booking last updated 2026-07-20; nothing since

## Fix recipe (NOT YET RUN)
**Must be done today (Thu 23 Jul) or first thing Fri 24 Jul morning**

SIS Admin -> Student 14602 (Eduardo Roche Diaz) -> Booking 18233 -> Courses -> BC25011
-> Assign to Class 6 (B2&C1 PM General English)

OR: Classes -> Class 6 -> Add student manually for BC25011

After Fri 24 Jul the course expires; fix only matters for attendance record.

## Risk / category
bookings / attendance; reversible. Single student. Blast radius low after expiry.

## Status: OPEN — EXPIRES TOMORROW Fri 24 Jul 2026
Last checked: Thu 23 Jul 2026 UTC (63rd hourly / 137th total)
