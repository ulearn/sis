Issue 26 addendum 4 Aug 2026

BC 23 (Intensive General 30, booking 22, ended 22 May 2026): active=true, 74d stale. BC 24826 (2wk Intensive General 30, booking 18034, ended 19 Jun 2026): active=true, 46d stale. Booking 18034 (student 14532): PARTIAL confirmed=false open=EUR 250 paid=EUR 845. Payment 17683 (EUR 845, paymentDate 23 Apr 2026): xeroPaymentId=null, 103d unreconciled.

FIX NOT RUN:
1. UPDATE booking_course SET active=false WHERE id IN (23, 24826);
2. Chase EUR 250 on booking 18034.
3. Link payment 17683 to Xero.

Last checked: 2026-08-04 UTC