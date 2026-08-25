Issue 39 Addendum 22 Jul 2026 — Xuezhen Huang BC24609 Still 0 SCAs

Sheet row: 41 | Check: 40th hourly Wed 22 Jul 2026 UTC

Root cause (fresh DB):
- BC24609 (Xuezhen Huang, student 14443, booking 17831): Morning General, 13 to 31 Jul 2026.
- Confirmed, active=true, 0 class assignments.
- 8 school days missed (13 Jul Mon through 22 Jul Wed today).
- 6 school days remaining: Thu 23 Jul, Fri 24 Jul, Mon 27 Jul, Tue 28 Jul, Wed 29 Jul, Thu 30 Jul, Fri 31 Jul.
  (Note: 7 if counting today, 6 remaining after today.)
- Accommodation confirmed correct (prior check).

Fix recipe (NOT YET RUN):
1. SIS > Bookings > Booking 17831 > student 14443 Xuezhen Huang
2. Find BC24609 (Morning General)
3. Add class assignment to current Morning General class
4. Confirm SCA record created

Risk: Bookings/class scheduling. Reversible. 8 days missed, 6 left.

Status: OPEN — Fix NOT RUN
Last checked: Wed 22 Jul 2026 UTC