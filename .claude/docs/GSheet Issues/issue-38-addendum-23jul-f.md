# Issue 38 addendum 23jul-f — August Bank Holiday still absent from school_closures
Addendum: 69th hourly check Thu 23 Jul 2026 UTC (142nd total)
Reporter: PG | Area: Holidays, Bookings etc. | Sheet row 40

## Symptom
August Bank Holiday (Mon 3 Aug 2026) and October Bank Holiday (Mon 27 Oct 2026) are missing from the school_closures table.

## Root cause (confirmed this check — fresh DB)
- school_closures table: 9 records (Good Fridays 2026-2030, Christmas 2026-2029)
- August Bank Holiday Mon 3 Aug 2026: STILL ABSENT — 11 calendar days away — CRITICAL
- October Bank Holiday Mon 27 Oct 2026: STILL ABSENT — 96 calendar days away
- Next closure in DB: Christmas id=7 startDate 2026-12-21
- Consequence: all bookings crossing Aug 3 or Oct 27 have incorrect end-date calculations
- Edith Nunes Issue 22 (BC24991, ends Aug 7) will lose 1 effective school day if BH not inserted
- No change from previous check (68th hourly, 141st total)

## Fix recipe (NOT YET RUN)
Step 1 — Via SIS Admin -> School Closures -> Add new closure:
  Name: August Bank Holiday | Start: 2026-08-03 | End: 2026-08-03 | Paid: yes

Step 2 — Add October Bank Holiday:
  Name: October Bank Holiday | Start: 2026-10-27 | End: 2026-10-27 | Paid: yes

Step 3 — Verify via SIS Admin -> School Closures list (should now show 11 records).

Step 4 — Re-run holiday shunt on any Academic Year bookings crossing these dates.

## Risk / category
bookings / dates; reversible. System-wide impact on all bookings crossing Aug 3 and Oct 27 2026.
Must be done before Aug 3 (11 days). Moderate blast radius.

## Status: OPEN — Aug BH 11 calendar days away — CRITICAL
Last checked: Thu 23 Jul 2026 UTC (69th hourly / 142nd total)
