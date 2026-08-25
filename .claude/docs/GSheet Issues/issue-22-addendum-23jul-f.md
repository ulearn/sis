# Issue 22 addendum 23jul-f — Edith Nunes: 9 school days missed, still unassigned
Addendum: 65th hourly check Thu 23 Jul 2026 UTC (142nd total)
Reporter: PG | Area: Booking / Class | Sheet row 23

## Symptom
Edith Nunes not appearing in to-be-assigned list; booking course 24991 has zero class assignments.

## Root cause (confirmed this check — fresh DB)
- Booking course 24991 (Edith Nunes, student 1015, booking 18214): General English AM, 13 Jul to 7 Aug 2026
- Class assignments: 0 — UNCHANGED
- 9 school days missed: Mon 13, Tue 14, Wed 15, Thu 16, Fri 17, Mon 20, Tue 21, Wed 22, Thu 23 Jul 2026
- 10 school days remaining (Fri 24 Jul to Fri 7 Aug); 9 effective after Aug Bank Holiday (Issue 38)
- Booking 18214: confirmed = true, amount paid EUR 608
- No change from previous check (64th hourly, 141st total)

## Fix recipe (NOT YET RUN)
SIS Admin -> Student 1015 (Edith Nunes) -> Booking 18214 -> Courses -> BC24991
-> Assign to General English AM class

Note: Aug Bank Holiday (Issue 38) must also be inserted to ensure correct course-end calculation.

## Risk / category
bookings / attendance; reversible. Single student. 9 days of attendance already unrecorded.

## Status: OPEN — CRITICAL — 9 school days missed, 10 remaining
Last checked: Thu 23 Jul 2026 UTC (65th hourly / 142nd total)
