# Issue 36b — Stale Booking Accommodations + Pietro Xero

Reporter: Diego | Area: Booking / Accomm | Sheet row: 38 | Check: 134th (5th Sat 1 Aug 2026 UTC)

## Symptom
Multiple booking accommodations remain active after their end date. Pietro Caccianiga payment unreconciled in Xero.

## Root Cause (fresh DB — updated count)

Stale booking accommodations (active = true, bed assigned, end date in 2026, before today): 47 records (was 46 last run; +1 new).

Newest additions:
  BA 11382 (Marcos Abrego Tofe, student 14587, bed 189): ended 2026-08-01 (TODAY)
  BA 29 (Martina Tartaro, student 14441, bed 177): ended 2026-07-26
  BA 26 (Jade Ribeiro, student 14453, bed 178): ended 2026-07-25
  BA 11184 (Pietro Colombo, student 72, bed 188): ended 2026-07-25
  BA 11366 (Marcos Abrego Tofe again, bed 189): ended 2026-07-25

Oldest 2026 stale: BA 11183 (ended 2026-03-06) — 148 days stale.

Pietro Caccianiga payment 17733 (EUR 5,331, Bank Transfer, booking 17980, 2026-06-02): xero_payment_id = null — 60 days unreconciled.

## Fix Recipe (NOT YET RUN)

Step 1 — Get full list of stale booking accommodations to deactivate:
  SELECT ba.id, ba.end_date, ba.booking_id FROM booking_accommodations ba
  WHERE ba.active = true AND ba.bed_id IS NOT NULL AND ba.end_date >= '2026-01-01' AND ba.end_date < NOW()
  ORDER BY ba.end_date;

Step 2 — Deactivate all stale BAs (47 records):
  UPDATE booking_accommodations SET active = false
  WHERE active = true AND bed_id IS NOT NULL AND end_date >= '2026-01-01' AND end_date < NOW();

Step 3 — Reconcile Pietro payment 17733 in Xero:
  Find bank receipt EUR 5,331 dated 2026-06-02 and match to invoice for booking 17980.
  Then: UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17733;

Step 4 — Verify:
  SELECT COUNT(*) FROM booking_accommodations WHERE active = true AND bed_id IS NOT NULL AND end_date >= '2026-01-01' AND end_date < NOW();
  Expected: 0.

## Risk
Category: accommodation, data-hygiene. Reversible: yes (SET active = true). Blast radius: 47 booking accommodation records.

## Status
Open — 134th check (5th today Sat 1 Aug). NOT FIXED. Count increased 46 to 47.
Last checked: 2026-08-01 UTC