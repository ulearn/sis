# Issue 38 — August Bank Holiday 2026 Missing (Addendum 28 Jul 2026 — 140th check)

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

## Root Cause (Tue 28 Jul 2026 UTC — 140th check)

school_closures table: 9 rows only (Good Fridays 2026-2030, Christmas 2026-2029).
August Bank Holiday Mon 3 Aug 2026 absent. Booking courses starting 2026-08-03 will not be auto-shunted.

BC count corrected: 17 active BCs start Mon 3 Aug (previous check said 18; one BC adjusted between runs).
BC IDs: 88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25003, 25010, 25016.

## Fix Recipe (NOT YET RUN)

Step 1 — Insert closure row:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, note)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, 'August Bank Holiday IE');

Step 2 — Verify (expect 10 rows):
  SELECT id, name, start_date, is_paid_holiday FROM school_closures ORDER BY start_date;

Step 3 — Check whether 17 existing Aug 3 BCs need manual end-date +1 day if shunt is not retroactive.

## Risk

Category: bookings/data-integrity | Reversible: yes | Blast radius: 17 BCs

## Status

OPEN — DEADLINE Fri 31 Jul 2026 (3 days). Fix NOT RUN.

## Last Checked

Tue 28 Jul 2026 UTC (140th hourly check)