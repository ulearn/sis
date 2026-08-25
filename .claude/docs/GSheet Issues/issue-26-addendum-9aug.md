# Issue 26 Addendum — 59th check — Sun 9 Aug 2026 UTC

Reporter: pg | Area: booking/class | Row 27

Stale booking courses (active=true):
- BC 23 (Intensive General 30): booking 22, ended 22 May 2026, 79 days stale
- BC 24826 (2wk Intensive General 30 08/06-19/06): booking 18034, ended 19 Jun 2026, 51 days stale

Booking 22 (CONFIRMED, fully paid EUR 1,948):
- Payment 17023: EUR 1,698 TransferMate 14 Feb 2026, xeroPaymentId=null
- Payment 17237: EUR 250 Stripe 1 Oct 2025, xeroPaymentId=null

Booking 18034 (PARTIAL, EUR 250 open):
- amountTotal=1,095 | amountPaid=845 | amountOpen=250 | confirmed=false
- Payment 17683: EUR 845 Bank 23 Apr 2026, xeroPaymentId=null

All 3 payments not in Xero (xeroPaymentId=null).

FIX RECIPE (NOT YET RUN):
1. UPDATE booking_courses SET active = false WHERE id IN (23, 24826);
2. Chase EUR 250 balance on booking 18034 (contact Ivan Rodriguez or agent).
3. Reconcile payments 17023, 17237, 17683 in Xero.

Risk: Step 1 low/reversible. Steps 2-3 admin/bookkeeping.
Status: Open, fix NOT RUN. 59th check, unchanged since 58th.
Last checked: Sun 9 Aug 2026 UTC