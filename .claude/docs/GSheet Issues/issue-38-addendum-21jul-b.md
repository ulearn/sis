Issue 38 -- Bank Holidays Missing -- Addendum 21 Jul 2026 (21st hrly)

Reporter: PG | Area: Holidays | Sheet row: 40

Root cause (95th check, Tue 21 Jul 2026 UTC):

school_closures table has 9 records: Good Friday 2026-2030, Christmas 2026-2029. No bank holidays. UNCHANGED.

MISSING:
- August Bank Holiday Mon 3 Aug 2026: 13 days away -- URGENT
- October Bank Holiday Mon 26 Oct 2026: 97 days away

Fix recipe (NOT YET RUN):
INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday, created_at) VALUES
  ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Public Holiday', false, NOW()),
  ('October Bank Holiday', '2026-10-26', '2026-10-26', 'Public Holiday', false, NOW());
Or via SIS admin: School Closures > Add.

Note: Aug BH 13 days away -- course-end calcs for courses straddling Aug 3 will be off-by-one until added.

Open -- Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC (21st hourly)