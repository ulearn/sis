Issue 38 addendum 23jul-c — Missing Bank Holiday school_closures (CRITICAL)
Addendum: 61st hourly check Thu 23 Jul 2026 UTC (134th total)
Reporter: PG | Area: Holidays, Bookings etc. | Sheet row 40

Symptom
Bank holidays not in school_closures; booking shunt system blind to Aug BH and Oct BH.

Root cause (confirmed this check)
- August Bank Holiday Mon 3 Aug 2026: ABSENT from school_closures — 11 calendar days away
- October Bank Holiday Mon 27 Oct 2026: ABSENT from school_closures — 96 calendar days away
- Next closure after today: Christmas id=7, startDate 2026-12-21
- Zero closures between 23 Jul and 21 Dec 2026

Impact
- Booking courses spanning Aug 3 will not shunt correctly
- Issue 22 (BC24991 ends Aug 7): remaining school day count wrong without Aug 3 in table

Fix recipe (NOT YET RUN)
Via SIS Admin -> School Closures -> Add (or direct DB insert):
1. August Bank Holiday: start 2026-08-03 end 2026-08-03 isPaidHoliday=true
2. October Bank Holiday: start 2026-10-27 end 2026-10-27 isPaidHoliday=true

Risk / category
bookings / data; reversible. Blast radius: all bookings crossing Aug 3 or Oct 27.

Status: OPEN — CRITICAL (Aug BH 11 days away)
Last checked: Thu 23 Jul 2026 UTC (61st hourly / 134th total)