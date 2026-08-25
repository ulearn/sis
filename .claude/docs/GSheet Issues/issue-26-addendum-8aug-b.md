Issue 26 -- Ivan Rodriguez / Ernesto Pesoa Stale BCs + EUR 250 (57th check, 8 Aug 2026)
Reporter: Staff | Area: Booking/Class | Sheet row: 27

Stale BCs:
  BC 23 (Intensive General 30, ended 2026-05-22): active=true, bookingId=22 (Ivan Rodriguez Solares) -- 78 days stale
  BC 24826 (2wk Intensive GE 30, ended 2026-06-19): active=true, bookingId=18034 (Ernesto Pesoa Gil) -- 50 days stale

Payment issue:
  Booking 18034 (Ernesto Pesoa Gil): PARTIAL, confirmed=false, amountPaid=EUR 845, amountTotal=EUR 1,095, amountOpen=EUR 250
  Payment 17683: EUR 845, xeroPaymentId=null, paymentDate=2026-04-23 -- 107 days without Xero reconciliation

Unchanged from previous check.

Fix (NOT YET RUN):
UPDATE booking_courses SET active = false WHERE id IN (23, 24826);
-- Chase EUR 250 outstanding from Ernesto Pesoa Gil (booking 18034)
-- Reconcile payment 17683 in Xero: UPDATE payments SET xero_payment_id = '<XERO_ID>' WHERE id = 17683;

Category: Bookings/Money | Reversible: Yes | Blast: 2 students, 1 open payment
Last checked: 2026-08-08 UTC (57th check)