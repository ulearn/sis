Issue 39 - Xuezhen Huang (ID 14443) — no class assigned to booking course 24609
Reporter: various | Area: Booking / Accomm | Sheet row: 41 | Last checked: 2026-07-22 UTC

Symptom: Student paid 3 weeks Host Family accommodation; accommodation confirmed but booking course has zero class assignments.

Root Cause:
- BC24609 (Xuezhen Huang, student 14443): Morning General, 2026-07-13 to 2026-07-31. ca_count=0. Active.
- 7 school days remaining as of Wed 22 Jul: Thu 23, Fri 24, Mon 27, Tue 28, Wed 29, Thu 30, Fri 31 Jul.
- Accommodation BA11358: Host Family, bed 180, 12 Jul to 2 Aug 2026, active=true.
- DB confirmed 0 class assignments — 50th hourly check Wed 22 Jul 2026 UTC (75th total).

Fix Recipe (NOT YET RUN):
1. SIS admin: navigate to student 14443 (Xuezhen Huang) > Booking > Booking Course 24609.
2. Assign to an available Morning General class for remaining 7 school days (23-31 Jul).
3. Verify class assignment appears in student profile.

Risk: Reversible. Blast radius 1 student. Course ends Jul 31.
Status: Open - fix NOT RUN. Wed 22 Jul 2026 UTC (50th hourly, 75th total).