Issue 45 addendum 23jul-c — Eduardo Roche: Renewal student missing class (FINAL HOUR)
Addendum: 62nd hourly check Thu 23 Jul 2026 UTC (94th total)
Reporter: AC | Area: Renewal students | Sheet row 47

Symptom
Eduardo Roche (student 14602) booking course 25011 has zero class assignments. Course EXPIRES TOMORROW Fri 24 Jul.

Root cause (confirmed this check)
- Booking course 25011: General English PM, 20-24 Jul 2026, booking 18233, student 14602 (Eduardo Roche Diaz)
- Class assignments: 0 (UNCHANGED — 4 school days lost)
- Course active = true, booking confirmed = true
- endDate = 2026-07-24 (tomorrow) — FINAL opportunity to assign

Fix recipe (NOT YET RUN)
SIS Admin -> Student 14602 -> Booking 18233 -> Courses -> Booking Course 25011
-> Assign to class 6 (B2&C1 PM General English)
Or: Classes -> Class 6 -> Add student 14602 / BC25011

After Fri 24 Jul the course is past; fix only matters for attendance record.

Risk / category
bookings / attendance; reversible.

Status: OPEN — EXPIRES TOMORROW Fri 24 Jul 2026
Last checked: Thu 23 Jul 2026 UTC (62nd hourly / 94th total)
