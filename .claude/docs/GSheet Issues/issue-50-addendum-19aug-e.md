Issue 50 - Stale Active Booking Accommodations (addendum 19 Aug 2026 E)
Reporter: XX | Area: Booking / Accomm | Sheet row: 52

Symptom: Checkout submission re-sends prior-week checkouts. Stale active BAs accumulating.

Root cause: Count now 36 stale active Booking Accommodations (was 35 at 20:03 UTC same day).

New this check (11th, ~21:00 UTC 19 Aug):
- Booking Accommodation 11286: Vincenzo Pio Di Costanzo (student 14501), bed 87, ended 2026-08-16, fee EUR 2,520, active = true — 3 days stale

Already tracked in null-fee list (not in group count until now):
- Booking Accommodation 11371: Luana Salzano (student 14576), bed 157, ended 2026-08-16, fee = null — confirmed 3 days stale

Null-fee Booking Accommodations (9): 11371, 11394, 11338, 11347, 11265, 11276, 11285, 11339, 11354
Code bug: checkout window still re-sends prior-week checkouts — unchanged.

Fix recipe (NOT YET RUN)

Add Booking Accommodation 11286 to deactivation batch from issue-50-addendum-19aug-d.md:
SQL: SELECT id, bed_id, end_date, fee, active FROM booking_accommodations WHERE id = 11286;
     -- Expect: bed_id=87, end_date=2026-08-16, fee=2520, active=true
SQL: UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11286; -- NOT YET RUN

Note: null-fee BAs — set fees before deactivating (check with Diego).
Code fix: see issue-50-checkout-double-submit.md

Risk: data-hygiene, reversible. Blast radius: accommodation providers and checkout UI; no financial impact.

Status: Open — fix NOT RUN. Last checked: 2026-08-19 UTC (11th check)