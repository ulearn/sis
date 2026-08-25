Issue 17 addendum 4 Aug 2026

Booking 1308: CANCELLED, confirmed=false, last updated 7 Jun 2026 (58d). Amount paid=EUR 1530 on cancelled booking. Amount open=null. BC 1350 (AY Afternoon, May25-Nov13 2026): active=true on cancelled booking. Payment 17186 EUR 1280 transactionId=D2026101 xeroPaymentId=null. Payment 17050 EUR 250 transactionId=D2026101 xeroPaymentId=null. Both share same transactionId - likely split at import.

FIX NOT YET RUN - Neil decision needed (reinstate or cancel?).
Option A - Reinstate: UPDATE booking SET status=CONFIRMED, confirmed=true WHERE id=1308;
Option B - Cancel: UPDATE booking_course SET active=false WHERE id=1350; reconcile EUR 1530 in Xero.
Either way: link pmts 17186+17050 to Xero.

Last checked: 2026-08-04 UTC