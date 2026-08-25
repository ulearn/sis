Issue 15 Addendum 22 Jul 2026 - b (87th check, 26th hourly)
Reporter: (various) | Row: 16 | 87th check (26th hourly) Wed 22 Jul UTC

Root Cause (fresh DB)
Student 1001 (Saikhantes Shagdarsuren):
- Booking 18151: CONFIRMED, Academic Year Afternoon service Jan 12 - Aug 7 2026
- Booking course 24925 (Academic Year Afternoon, 9 Mar - 2 Oct 2026): active = true
- Class assignment 255 (class 11): weekEnd = 2026-07-03 - EXPIRED 19 days ago
- No active or future class assignment exists

Permanently missed: weeks of 6 Jul and 13 Jul 2026 (irrecoverable)
Holiday 2500 (booking 18151): 20 Jul - 21 Aug 2026 - student is on holiday, no school days to assign
Next: assign booking course 24925 to class 11 from week of Mon 24 Aug 2026
UNCHANGED from 86th check (25th hourly, same day - G column formatting change triggered hash re-check).

Fix Recipe (NOT YET RUN)
1. On/after Mon 24 Aug 2026: SIS Admin, student 1001, booking 18151, booking course 24925, Assign to Class. NOT YET RUN.
2. Low priority: deactivate booking course 1982 (AY Morning, ended Dec 2025, booking 1724, active = true).

Risk: bookings/class assignment | Reversible | Blast radius: student 1001 only; 2 missed weeks irrecoverable
Status: OPEN - waiting until Mon 24 Aug 2026. Last checked: Wed 22 Jul 2026 UTC (87th check / 26th hourly)
