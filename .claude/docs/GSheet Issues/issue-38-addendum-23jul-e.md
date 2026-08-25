# Issue 38 addendum 23jul-e — August Bank Holiday still absent from school_closures
Addendum: 67th hourly check Thu 23 Jul 2026 UTC (140th total)
Reporter: PG | Area: Holidays, Bookings etc. | Sheet row 40

## Symptom
Course date UX improvements requested; core issue is missing public holidays in school_closures.

## Root cause (confirmed this check — fresh DB)
- school_closures table: 9 records (Good Fridays 2026-2030, Christmas 2026-2029)
- August Bank Holiday Mon 3 Aug 2026: STILL ABSENT — 11 calendar days away — CRITICAL
- October Bank Holiday Mon 27 Oct 2026: STILL ABSENT — 96 calendar days away
- Zero closures between Thu 23 Jul 2026 and Mon 21 Dec 2026
- Consequence: Edith Nunes (Issue 22) course ends 7 Aug — losing 1 effective day; any booking ending in Aug/Oct window has wrong end-date calculations

## Fix recipe (NOT YET RUN)
Step 1 — Insert August Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true);

Step 2 — Insert October Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES ('October Bank Holiday', '2026-10-27', '2026-10-27', true);

Step 3 — Verify via SIS Admin -> School Closures list.

Step 4 — Re-run holiday shunt on any AY bookings that cross these dates (the shunt should auto-adjust end dates).

## Risk / category
bookings / dates; reversible. System-wide impact on all bookings crossing Aug 3 and Oct 27 2026.
Moderate blast radius; must be done before Aug 3.

## Status: OPEN — Aug BH 11 days away, CRITICAL
Last checked: Thu 23 Jul 2026 UTC (67th hourly / 140th total)
