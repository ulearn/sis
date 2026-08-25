Issue 36b — Stale Booking Accommodations + Pietro Xero unreconciled
====================================================================

Reporter: KC  Area: Booking/Accommodation  Sheet row: 38
Checked: 2026-08-01 UTC (130th hrly, 1st of day)

ROOT CAUSE (UNCHANGED from Fri 31 Jul)
- Stale booking accommodations: 46 records (active=true, bed assigned, end_date before today).
- Oldest stale: Booking accommodation 11183 (bed 89, ended 2026-03-06) — 148 days stale.
- Next oldest: Booking accommodations 11185 + 9905 (both ended 2026-05-03) — 90 days stale.
- Pietro Caccianiga payment 17733: EUR 5,331, Bank transfer, booking 17980, xeroPaymentId=null.
  Created 2026-06-03 — 59 days without Xero reconciliation.

FIX RECIPE (NOT YET RUN)

Step 1 - Verify count (NOT YET RUN):
  SELECT COUNT(*) FROM booking_accommodations
  WHERE active=true AND end_date < CURRENT_DATE AND end_date > '2026-01-01' AND bed_id IS NOT NULL;
  -- Expected: 46

Step 2 - Deactivate 46 stale booking accommodations (NOT YET RUN):
  UPDATE booking_accommodations SET active=false, updated_at=NOW()
  WHERE active=true AND end_date < CURRENT_DATE AND end_date > '2026-01-01' AND bed_id IS NOT NULL;

Step 3 - Reconcile Pietro payment 17733 in Xero (NOT YET RUN):
  Find Xero payment for EUR 5,331 / booking 17980 (Pietro Caccianiga, Jun 2026).
  Then: UPDATE payments SET xero_payment_id = '<XERO_ID>', updated_at = NOW() WHERE id = 17733;

RISK: bookings/financial/data-hygiene, reversible, 46 records + 1 payment.
STATUS: OPEN — Fix NOT RUN. Last checked: 2026-08-01 UTC (130th, 1st of day)
