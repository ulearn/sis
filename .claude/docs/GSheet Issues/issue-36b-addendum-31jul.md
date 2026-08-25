Issue 36b - Stale Accommodation Bookings (129th check, Fri 31 Jul 2026 UTC)
Reporter: KC, Sheet row: 38

STATUS: UNCHANGED - 46 stale BAs, Pietro Xero still unreconciled.

EVIDENCE (live DB, Fri 31 Jul 2026):

Stale booking accommodations (active=true, end_date < today, end_date > 2026-01-01, bed_id not null): 46
Oldest stale: BA 11183, ended 2026-03-06 (bed 89) - 147 days stale.
Last cron check: Thu 30 Jul 2026 (128th check) - count was also 46, no change.

Pietro payment 17733: amount = EUR 5331, xero_payment_id = null, booking_id = 17980
Payment date: 2026-06-02 - now 59 days without Xero reconciliation.

FIX RECIPE (NOT YET RUN):

Step 1 - Deactivate 46 stale BAs:
  SQL (NOT YET RUN):
  UPDATE booking_accommodations SET active = false, updated_at = NOW()
  WHERE active = true
    AND end_date < CURRENT_DATE
    AND end_date > '2026-01-01'
    AND bed_id IS NOT NULL;
  Verify count = 46 before running.

Step 2 - Reconcile Pietro payment 17733 in Xero:
  Match EUR 5331 to invoice for booking 17980 (Pietro Caccianiga).
  Then: UPDATE payments SET xero_payment_id = '<XERO_ID>', updated_at = NOW() WHERE id = 17733;

RISK: Bookings/Money - reversible. Blast radius: 46 BA records + 1 payment.
STATUS: OPEN - Fix NOT RUN - Last checked: Fri 31 Jul 2026 UTC (129th check)
