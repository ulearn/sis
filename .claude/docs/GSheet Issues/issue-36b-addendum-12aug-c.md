ISSUE 36b - Pietro Caccianiga / Accommodation (BA 11393 fee null, BC ends 9 days)
Reporter: KC | Sheet row: 38 | 165th check Wed 12 Aug 2026 UTC

Symptom: Second accommodation period (22 Aug-13 Sep) has no fee. Xero payment unreconciled.

Root Cause (unchanged from 164th check):
  BA 11311 (bk 17980): bed 84 (A1/Room 3), 28 Jun to 22 Aug 2026, fee EUR 3,850 - correct
  BA 11393 (bk 17980): bed 88 (A2/Room 3, confirmed assigned), 22 Aug to 13 Sep 2026, fee = NULL
  BC 24772 (General English AM): ends 21 Aug 2026 - 9 days remaining, 2 SCAs
  Payment 17733: EUR 5,331, Bank, 2 Jun 2026, xeroPaymentId = null - 70 days unreconciled
  Booking 17980: CONFIRMED, EUR 5,331 paid, EUR 0 open - fully paid

Fix Recipe (NOT YET RUN):
  1. Enter fee for BA 11393: open SIS -> Booking 17980 -> Accommodation -> BA 11393 -> enter fee.
     Calculate 3-week rate for A2/Room 3 (22 Aug to 13 Sep 2026).
  2. Reconcile Payment 17733 (EUR 5,331, Jun 2) in Xero against booking 17980 invoice.

Risk: Accounts/Accommodation - non-destructive fee entry. Xero reconciliation in Xero only.
Status: OPEN - not run. Fee null. Xero 70d unreconciled. BC ends Aug 21 (9d).
Last checked: Wed 12 Aug 2026 UTC (165th check)