Issue 38 -- Bank Holidays missing from school_closures -- Addendum 21 Jul 2026 (26th hrly)

Reporter: PG | Area: Holidays, Bookings etc. | Sheet row: 40

Root cause (99th check, Tue 21 Jul 2026 UTC):

school_closures table: 9 records (Good Fridays 2026-2030; Christmas 2026-2029).

MISSING:
  August Bank Holiday  -- Mon 3 Aug 2026  -- 13 days away  URGENT
  October Bank Holiday -- Mon 26 Oct 2026 -- 97 days away

202 active booking courses span 3 Aug 2026 and need end-date extension if shunt triggers.
UNCHANGED from 25th hourly check.

Fix recipe (NOT YET RUN):

Step 1 -- Add missing bank holidays:
  INSERT INTO school_closures (name, start_date, end_date, created_at)
  VALUES
    ('August Bank Holiday', '2026-08-03', '2026-08-03', NOW()),
    ('October Bank Holiday', '2026-10-26', '2026-10-26', NOW());

Step 2 -- Verify:
  SELECT id, name, start_date FROM school_closures ORDER BY start_date;
  (Should show 11 records.)

Step 3 -- Trigger shunt for 202 active BCs spanning Aug 3:
  Check if shunt runs automatically or must be triggered manually.
  If manual: SIS admin > School Closures > Run Shunt.

Risk: data-hygiene; reversible (DELETE inserted rows by id if wrong).
Aug BH 13 days away -- 202 courses lose 1 day of tuition if not resolved before Aug 3.
Open -- Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC (26th hourly)
