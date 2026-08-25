# Issue 38 addendum — Mon 20 Jul 2026 (92nd check, 16th hourly)

Area: School Closures | Sheet row 40

## Current status (fresh DB Mon 20 Jul 2026 UTC)

- August Bank Holiday Mon 3 Aug 2026: STILL absent from school_closures — 14 days until it occurs
- October Bank Holiday Mon 26 Oct 2026: STILL absent from school_closures — 98 days away
- 9 closures in DB (Good Fridays 2026 to 2030, Christmas 2026 to 2029) — no bank holidays present

URGENT: Aug BH is 14 days away. AY course shunts will not account for it unless added now.
Immediately affected: Samuele Stenico BC24990 and Edith Nunes BC24991 (both end 7 Aug; Issues 22 and 45).

## Fix recipe (NOT YET RUN)

Table confirmed: school_closures
Columns: id (auto), created_at (auto), name, start_date, end_date, note, is_paid_holiday

Via SIS Admin > System > School Closures > Add, or SQL:

  -- NOT YET RUN
  INSERT INTO school_closures (name, start_date, end_date)
    VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03');
  INSERT INTO school_closures (name, start_date, end_date)
    VALUES ('October Bank Holiday', '2026-10-26', '2026-10-26');

## Risk
data-hygiene / bookings — reversible (delete row to undo). If not added before 3 Aug, new AY bookings will have end dates off by 1 day.

## Status
OPEN. Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC (92nd check, 16th hourly).