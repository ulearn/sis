# Issue 36b — Pietro Caccianiga, Payment Unreconciled — 3 Aug 2026 UTC
Reporter: KC | Area: Booking/Accommodation | Sheet row: 38 | Student: 14521

Root cause (unchanged):
- Booking 17980 (confirmed=true, EUR 5,331 fully paid): OK
- BA 11311 (bed 84, Jun28-Sep13 2026): active=true, fee=3,850 — dates correct
- Payment 17733 (EUR 5,331): bookingId=17980, xeroPaymentId=null — 62d unreconciled (Jun3 2026)
- Booking 17850: CONFIRMED, confirmed=false, amountPaid=null, amountOpen=321.35

Fix recipe (NOT YET RUN):
Step 1 - Reconcile pmt 17733 in Xero: find EUR 5,331 received Jun3 for Pietro, match to bk17980 invoice; SIS xeroPaymentId updates on next fins sync (ssh hub@localhost, check fins/ scripts)
Step 2 - Clarify bk17850 (amountOpen=321.35, confirmed=false): if cancelled set status=CANCELLED; if valid link payment and set confirmed=true

Risk: money, medium (Xero reconciliation). Reversible.
Status: OPEN — NOT RUN. Last checked: 2026-08-03 UTC (pmt17733 xeroPaymentId=null, 62d)