Issue 38 -- Bank Holidays missing from school_closures -- Addendum 21 Jul 2026 (24th hrly)

Reporter: PG | Area: Holidays, Bookings etc. | Sheet row: 40

Root cause (97th check, Tue 21 Jul 2026 UTC):

school_closures table -- current contents (9 records):
  Good Friday 2026-04-03
  Christmas 2026-12-21 to 2027-01-03
  Good Friday 2027-03-26
  Christmas 2027-12-20 to 2028-01-04
  Good Friday 2028-04-14
  Christmas 2028-12-18 to 2029-01-02
  Good Friday 2029-03-30
  Christmas 2029-12-24 to 2030-01-06
  Good Friday 2030-04-19

MISSING (UNCHANGED from 22nd hourly check):
  August Bank Holiday -- Mon 3 Aug 2026 -- 13 days away
  October Bank Holiday -- Mon 26 Oct 2026 -- 97 days away

Fix recipe (NOT YET RUN):
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
VALUES
  ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW()),
  ('October Bank Holiday', '2026-10-26', '2026-10-26', true, NOW());

Risk: data-hygiene; reversible (DELETE by id). Aug BH 13 days away -- URGENT.
Open -- Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC (24th hourly)
