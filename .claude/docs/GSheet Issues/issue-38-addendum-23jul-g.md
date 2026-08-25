Issue 38 addendum 23jul-g — August Bank Holiday still absent from school_closures
Addendum: 70th hourly check Thu 23 Jul 2026 UTC (143rd total)
Reporter: PG | Area: Holidays, Bookings etc. | Sheet row 40

Symptom
August Bank Holiday (Mon 3 Aug 2026) and October Bank Holiday (Mon 27 Oct 2026) are missing from school_closures.

Root cause (confirmed this check — fresh DB)
- school_closures table: 9 records (Good Fridays 2026-2030, Christmas 2026-2029)
- August Bank Holiday Mon 3 Aug 2026: STILL ABSENT — 11 calendar days away — CRITICAL
- October Bank Holiday Mon 27 Oct 2026: STILL ABSENT — 96 calendar days away
- Next closure in DB: Christmas 2026-12-21 (id=7)
- Consequence: all bookings crossing Aug 3 or Oct 27 have incorrect end-date calculations
- No change from 69th check (142nd total)

Fix recipe (NOT YET RUN)
Step 1 — SIS Admin -> School Closures -> Add new closure:
  Name: August Bank Holiday | Start: 2026-08-03 | End: 2026-08-03 | Paid: yes

Step 2 — Add October Bank Holiday:
  Name: October Bank Holiday | Start: 2026-10-27 | End: 2026-10-27 | Paid: yes

Step 3 — Verify via SIS Admin -> School Closures list (should now show 11 records).

Step 4 — Re-run holiday shunt on any AY bookings crossing these dates.

Risk / category
bookings / dates; reversible. System-wide impact on all bookings crossing Aug 3 and Oct 27 2026.
Must be done before Aug 3 (11 days). Moderate blast radius.

Status: OPEN — Aug BH 11 calendar days away — CRITICAL
Last checked: Thu 23 Jul 2026 UTC (70th hourly / 143rd total)