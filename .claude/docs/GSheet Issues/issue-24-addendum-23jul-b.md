Issue 24 addendum 23jul-b — Alberto Squillace: Missing class assignment + fee null (Day 4)
Addendum: 49th hourly check Thu 23 Jul 2026 UTC (125th total)
Reporter: AC | Area: Booking | Sheet row 25

Symptom
Alberto Squillace not assigned to class; booking course fee is null. Day 4 of course.

Root cause (confirmed this check)
- Booking course 24686: Morning General, 20 Jul - 18 Sep 2026, booking 1611, student 1052 (Alberto Squillace)
- Fee: null (UNCHANGED)
- Class assignments: 0 (UNCHANGED)
- School days in course: 4 (Mon 20 - Thu 23 Jul)
- Booking 1611 fully paid: EUR 1,280.12 / 1,280.12
- Prior course BC1797 (12 wks, EUR 1,836): student was in class 12 (B1 AM 2) — use as placement reference

Fix recipe (NOT YET RUN)
Step 1 — Set fee on booking course 24686:
  SIS Admin -> Student 1052 -> Booking 1611 -> Courses -> BC24686 -> Edit -> Fee = 1280.12 (or correct amount)

Step 2 — Assign to class:
  SIS Admin -> Student 1052 -> Booking 1611 -> Courses -> BC24686 -> Assign to class 12 (B1 AM 2)
  Effective from 2026-07-20

Risk / category
bookings / class / data-hygiene; reversible. 4 school days already missed.

Status: OPEN — Day 4; fix promptly
Last checked: Thu 23 Jul 2026 UTC (49th hourly / 125th total)
