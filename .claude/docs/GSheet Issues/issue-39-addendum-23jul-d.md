Issue 39 addendum 23jul-d — Xuezhen Huang: Missing class assignment (6 days left)
Addendum: 62nd hourly check Thu 23 Jul 2026 UTC (87th total)
Reporter: KC | Area: Booking / Accomm | Sheet row 41

Symptom
Booking course 24609 has zero class assignments; 6 school days remaining.

Root cause (confirmed this check)
- Booking course 24609: Morning General, 13 Jul - 31 Jul 2026, booking 17831, student 14443 (Xuezhen Huang)
- Class assignments: 0 (UNCHANGED)
- Course active = true
- School days remaining: 6 (Fri 24, Mon 27, Tue 28, Wed 29, Thu 30, Fri 31 Jul)

Fix recipe (NOT YET RUN)
SIS Admin -> Student 14443 -> Booking 17831 -> Courses -> Booking Course 24609
-> Assign to an available Morning General class

See main recipe: issue-39-xuezhen-host-class.md for accommodation fix steps.

Risk / category
bookings / attendance; reversible. Blast radius: single student, 6 school days left.

Status: OPEN — 6 school days left (course ends Fri 31 Jul 2026)
Last checked: Thu 23 Jul 2026 UTC (62nd hourly / 87th total)
