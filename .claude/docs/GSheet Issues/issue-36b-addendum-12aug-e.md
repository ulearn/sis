# Issue 36b - Pietro Caccianiga - BA Fee + Xero (167th check 12 Aug 2026)

Reporter: AC  Area: Booking/Accomm  Sheet row: 38

## Symptom
Accommodation dates error. BA fee unset; payment unreconciled in Xero.

## Root Cause (unchanged)
- BA 11393: bed 88, active=true, 22 Aug - 13 Sep 2026, fee=null (unset 71+ days)
- BC 24772 (General English AM, student 14521): ends 21 Aug 2026 (9 days)
- Payment 17733: EUR 5,331, xeroPaymentId=null, created 3 Jun 2026 (71 days unreconciled)

## Fix Recipe - NOT YET RUN

Step 1 - Set BA 11393 fee:
Confirm agreed rate with Diego/accounts, then:
  UPDATE booking_accommodations SET fee=<amount> WHERE id=11393;

Step 2 - Reconcile Payment 17733 in Xero:
Log into Xero, locate receipt, match to Pietro invoice.

## Risk
Category: money/bookings. Reversible. Blast radius: 1 student, 1 payment, 1 BA.

## Status
Fix NOT RUN. Unchanged 167 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC (167th check, run 221)