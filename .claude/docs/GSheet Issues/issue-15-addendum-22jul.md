# Issue 15 Addendum 22 Jul 2026 (85th check)
Reporter: (various) | Row: 16 | 85th check (24th hourly) Wed 22 Jul UTC

## Root Cause (fresh DB)
Student 1001 (Saikhantes Shagdarsuren):
- BK18151: CONFIRMED, service Jan12-Aug7 2026
- BC24925 (AY Afternoon, Mar9-Oct2 2026): active=true
- SCA255 (class 11): weekEnd=2026-07-03 - EXPIRED 19 days ago
- No active or future SCA exists

Permanently missed: weeks of Jul6 + Jul13 2026 (irrecoverable)

Holiday 2500 (BK18151): Jul20-Aug21 2026 (5 wks) - student away now

Next: assign BC24925 to class 11 from week of Mon 24 Aug 2026

UNCHANGED from 84th check (Tue 21 Jul).

## Fix Recipe (NOT YET RUN)
1. On/after Mon 24 Aug 2026: assign BC24925 to class 11 from week of Aug 24.
   SIS Admin -> BK18151 -> BC24925 -> Assign to Class -- NOT YET RUN
2. Low priority: UPDATE booking_course SET active=false WHERE id=1982;
   (BC1982 AY Morning ended Dec2025, BK1724, still active)

## Risk
category: bookings/class assignment | reversible: yes | blast radius: student 1001 only; 2 missed weeks irrecoverable

## Status
OPEN - waiting until Mon 24 Aug 2026. Last checked: Wed 22 Jul 2026 UTC (85th / 24th hourly)
