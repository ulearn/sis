Issue 3 -- School Closures / August Bank Holidays

Reporter: NM | Area: Bookings | Sheet row: 4
230th check -- Fri 14 Aug 2026 UTC

Symptom:
August Bank Holidays 2027-2030 absent from school_closures table.

Root Cause:
9 closures confirmed: Good Fridays 2026-2030, Christmas 2026-2029.
Missing: Aug BH 2027, 2028, 2029, 2030. No change since 229th check Thu 13 Aug.
Aug BH 2026 (2026-08-03) passed without a DB entry -- no reported impact.

Fix Recipe (NOT YET RUN - low priority):
INSERT INTO school_closures (start_date, end_date, name) VALUES
  ('2027-08-02', '2027-08-02', 'August Bank Holiday'),
  ('2028-08-07', '2028-08-07', 'August Bank Holiday'),
  ('2029-08-05', '2029-08-05', 'August Bank Holiday'),
  ('2030-08-04', '2030-08-04', 'August Bank Holiday');
-- Verify first Monday of August for each year before running.

Status: OPEN (low priority). Last checked: Fri 14 Aug 2026 UTC (230th check)
Previous recipe: issue-3-addendum-13aug.md
