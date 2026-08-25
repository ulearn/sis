Issue 38 addendum 23jul-d — Missing Bank Holiday school_closures (CRITICAL — 11 days)
Addendum: 63rd hourly check Thu 23 Jul 2026 UTC (136th total)
Reporter: PG | Area: Holidays, Bookings etc. | Sheet row 40

Symptom
Bank holidays not in school_closures; booking shunt system blind to Aug BH and Oct BH.

Root cause (confirmed this check)
- August Bank Holiday Mon 3 Aug 2026: ABSENT from school_closures — 11 calendar days away
- October Bank Holiday Mon 27 Oct 2026: ABSENT from school_closures — 96 calendar days away
- Next closure: Christmas id=7, startDate 2026-12-21
- Zero closures between 23 Jul 2026 and 21 Dec 2026
- Confirmed by live DB: only IDs 1,7,8,9,10,11,12,13,14 present (Good Fridays + Christmas only)

Impact
- Booking courses spanning Aug 3 will not shunt correctly
- Issue 22 (BC24991 ends Aug 7): remaining day count of 11 should be 10 once Aug BH added

Fix recipe (NOT YET RUN)
Via SIS Admin -> School Closures -> Add:
  1. Name: August Bank Holiday  start: 2026-08-03  end: 2026-08-03  isPaidHoliday: true
  2. Name: October Bank Holiday  start: 2026-10-27  end: 2026-10-27  isPaidHoliday: true

Or direct DB (DO NOT RUN without Neil approval):
  INSERT INTO school_closure (name, startDate, endDate, isPaidHoliday) VALUES
    ('August Bank Holiday', '2026-08-03', '2026-08-03', true),
    ('October Bank Holiday', '2026-10-27', '2026-10-27', true);

Risk / category
bookings / data; reversible. Blast radius: all bookings crossing Aug 3 or Oct 27.

Status: OPEN — CRITICAL (Aug BH 11 days away)
Last checked: Thu 23 Jul 2026 UTC (63rd hourly / 136th total)
