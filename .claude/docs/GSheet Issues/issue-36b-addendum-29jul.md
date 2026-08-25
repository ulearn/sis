# Issue 36b — Stale BAs + Pietro Payment (addendum 29 Jul 2026)
Reporter: KC | Area: Booking/Accomm | Sheet row 38

## Root Cause (live data, Wed 29 Jul 2026 UTC)

### Stale accommodation bookings
- Active BAs with end_date before today AND bed_id not null: 46 (unchanged)
- Oldest stale: BA 11183 (bed 89, ended 6 Mar 2026, 145 days ago)
- Second: BA 9905 (bed 47, ended 3 May 2026)
- Note: 4,361 BAs have no bed and epoch dates — legacy migration artefacts (separate issue)

### Pietro payment ID 17733
- Amount: EUR 5,331 | Method: Bank | Created: 3 Jun 2026 (56 days)
- Booking 17980 (Pietro Caccianiga, student 14521) — CONFIRMED
- HubSpot deal: 501813359827
- xero_payment_id = null — not reconciled in Xero

## Fix Recipe (NOT YET RUN)
Step 1 — Deactivate 46 stale BAs:
  -- Preview first:
  SELECT id, bed_id, start_date, end_date FROM booking_accommodations
  WHERE active = true AND bed_id IS NOT NULL AND end_date < CURRENT_DATE ORDER BY end_date;
  -- Then execute:
  UPDATE booking_accommodations SET active = false
  WHERE active = true AND bed_id IS NOT NULL AND end_date < CURRENT_DATE;

Step 2 — Reconcile Pietro payment 17733 in Xero:
  Log into Xero; find/create bank reconciliation for EUR 5,331 received ~3 Jun 2026.
  Link to booking 17980 / HubSpot deal 501813359827.
  UPDATE payments SET xero_payment_id = "<xero_id>" WHERE id = 17733;

## Risk: bookings + money | BA deactivation reversible (46 records) | Xero reconciliation needs account review
## Status: Open — 126th check. Fix NOT RUN. Last checked: 2026-07-29 UTC