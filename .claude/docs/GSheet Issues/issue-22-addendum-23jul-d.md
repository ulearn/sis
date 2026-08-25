Issue 22 addendum 23jul-d — Edith Nunes: Missing class assignment (9 days missed, CRITICAL)
Addendum: 59th hourly check Thu 23 Jul 2026 UTC (82nd total)
Reporter: AC | Area: Booking / Class | Sheet row 23

Symptom
Edith Nunes not appearing in class to-be-assigned list; 9 school days missed.

Root cause (confirmed this check)
- Booking course 24991: General English AM, 13 Jul - 7 Aug 2026, booking 18214, student 1015 (Edith Nunes)
- Class assignments: 0 (UNCHANGED)
- Course active = true
- School days missed: 9 (Mon 13 Jul through Thu 23 Jul)
- Remaining: 11 days (Fri 24 Jul to Fri 7 Aug) — or 10 if Aug BH added (see issue 38)

Fix recipe (NOT YET RUN)
SIS Admin -> Student 1015 -> Booking 18214 -> Courses -> Booking Course 24991
-> Assign to an available General English AM class

Note: Also add Aug Bank Holiday to school_closures (issue 38) to correct the remaining day count.

Risk / category
bookings / attendance / CRITICAL; reversible. 9 school days of attendance already missed without class record.

Status: OPEN — CRITICAL; 9 days missed; assign immediately
Last checked: Thu 23 Jul 2026 UTC (59th hourly / 82nd total)
