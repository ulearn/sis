Issue 38 -- Bank Holidays missing from school_closures -- Addendum 21 Jul 2026 (25th hrly)

Reporter: PG | Area: Holidays, Bookings etc. | Sheet row: 40

Root cause (98th check, Tue 21 Jul 2026 UTC):

school_closures table -- 9 records present (Good Fridays 2026-2030, Christmas 2026-2029).

MISSING (UNCHANGED from 24th hourly check):
  August Bank Holiday -- Mon 3 Aug 2026 -- 13 days away
  October Bank Holiday -- Mon 26 Oct 2026 -- 97 days away

Fix recipe (NOT YET RUN):
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
VALUES
  ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW()),
  ('October Bank Holiday', '2026-10-26', '2026-10-26', true, NOW());

Risk: data-hygiene; reversible (DELETE by id). Aug BH 13 days away -- URGENT.
Open -- Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC (25th hourly)
