Issue 50 -- Stale Active Booking Accommodations (addendum 20 Aug 2026)
Reporter: XX | Area: Booking/Accomm | Sheet row: 52 | Run: 12th

ROOT CAUSE (12th check, Thu 20 Aug 2026 UTC -- no change from 11th check Wed 19 Aug):
Count: 36 stale active Booking Accommodations (bed assigned, end_date < today) -- unchanged.
Most recent stale:
- Booking Accommodation 11286 (Vincenzo Pio Di Costanzo, student 14501, bed 87, ended 16 Aug, fee EUR 2,520) -- 4d stale
- Booking Accommodation 11371 (Luana Salzano, student 14576, bed 157, ended 16 Aug, fee = null) -- 4d stale
9 Booking Accommodations with fee = null: 11371, 11394, 11338, 11347, 11265, 11276, 11285, 11339, 11354
Code bug: checkout window re-sends prior-week checkouts -- unchanged.

FIX RECIPE (NOT YET RUN):
Step 1 -- Confirm null-fee amounts with Diego
  SQL: SELECT id, bed_id, start_date, end_date, fee FROM booking_accommodations WHERE id IN (11371,11394,11338,11347,11265,11276,11285,11339,11354);
Step 2 -- Deactivate all non-null-fee stale BAs
  SQL: UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE active = true AND end_date < '2026-08-20' AND bed_id IS NOT NULL AND id NOT IN (11371,11394,11338,11347,11265,11276,11285,11339,11354); -- NOT YET RUN
Step 3 -- After fees confirmed: set fees + deactivate null-fee BAs individually
Step 4 -- Fix checkout window code (see issue-50-checkout-double-submit.md)

RISK: data-hygiene | Reversible | No financial impact if fees set first
Status: Open -- Fix NOT RUN. Last checked: 2026-08-20 UTC (12th run)