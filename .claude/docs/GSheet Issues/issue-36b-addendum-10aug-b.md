# Issue 36b - Pietro Caccianiga: Class Assigned, Xero Payment Pending (Mon 10 Aug - 2nd check)

Reporter: DG | Area: Booking / Accomm | Sheet row: 38

## Root Cause (156th check - Mon 10 Aug 2026 UTC)
Class assignment RESOLVED since last check. Xero reconciliation still outstanding.

Evidence:
- Booking Course 24772 (General English AM, booking 17980): 2 class assignments now present - class issue RESOLVED
- Booking 17980 (Pietro Caccianiga): CONFIRMED, confirmed = true, EUR 5,331 fully paid (EUR 0 open)
- Payment 17733 (EUR 5,331, Bank Transfer, 2026-06-02): xero_payment_id = null - 69 days unreconciled
- Payment 17519 (EUR 321.35, Bank Transfer, 2026-05-07) on booking 17850 (Paola Sthefane Moreira): xero_payment_id = null - 95 days unreconciled
- Booking Course 24772 ends 2026-08-21 (11 days)

## Fix Recipe (NOT YET RUN)
Step 1: In Xero, reconcile bank transaction EUR 5,331 (received 2026-06-02) against the invoice for Pietro Caccianiga.
Step 2: In Xero, reconcile bank transaction EUR 321.35 (received 2026-05-07) against the invoice for Paola Sthefane Moreira.
Step 3 - Verify after Xero sync:
  SELECT id, amount, method, payment_date, xero_payment_id FROM payments WHERE id IN (17733, 17519);
  -- xero_payment_id should be non-null after reconciliation sync

## Risk
Category: accounts | Reversible: yes | Blast radius: 2 unreconciled payments (EUR 5,331 + EUR 321.35 = EUR 5,652.35)

## Status: PARTIAL - Class assigned (resolved); Xero reconciliation pending for payments 17733 and 17519
Last checked: 2026-08-10 UTC (156th hourly check)