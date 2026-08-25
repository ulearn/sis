# Issue 38 — August + October Bank Holidays Missing

Reporter: Various | Area: Holidays, Bookings | Sheet row: 40

## Symptom
August Bank Holiday (Mon 3 Aug 2026) and October Bank Holiday (Mon 27 Oct 2026) absent from school_closures.

## Root cause (Fri 24 Jul 2026 UTC — 75th per-issue check)
Queried school_closures table: 9 closures exist (all Good Fridays + Christmas). Missing:
- 2026-08-03 August Bank Holiday (Mon) — 10 calendar days away
- 2026-10-27 October Bank Holiday (Mon)

Known impact:
- BC24956 (Giampaolo Russo, Issue 41): starts 3 Aug 2026 = the Bank Holiday itself
- BC24991 (Edith Nunes, Issue 22): ends 7 Aug, Aug BH within course, end date not extended

## Fix recipe (NOT YET RUN)
Step 1 — verify: SELECT * FROM school_closures WHERE start_date BETWEEN 2026-08-01 AND 2026-08-05;

Step 2 — insert:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at) VALUES
  (August Bank Holiday, 2026-08-03, 2026-08-03, false, NOW()),
  (October Bank Holiday, 2026-10-27, 2026-10-27, false, NOW());

Step 3 — check BC24956 (Giampaolo): if start_date = 2026-08-03, shift to 2026-08-04 (Tue).
Step 4 — check BC24991 (Edith Nunes): if end_date = 2026-08-07 and Aug BH is now a closure, end date should extend to 2026-08-10.

Risk: Medium / partially reversible. Inserting closures is safe; course end-date adjustments need individual review. Blast radius: all active courses spanning 3 Aug and 27 Oct 2026.

## Status
STILL OPEN — Aug BH is 10 calendar days away. Fix NOT RUN.
Last checked: Fri 24 Jul 2026 UTC (75th per-issue check, 148th total)