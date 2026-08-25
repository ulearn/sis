Issue 36b - Pietro Caccianiga - Accomm Fee + Xero - 178th check Thu 13 Aug 2026 UTC

Reporter: AC  Area: Booking/Accomm  Sheet row: 38  Student: 14521

SYMPTOM: BA 11393 fee=null. PMT 17733 Xero unreconciled. Check-in in 9 days (Aug 22).

ROOT CAUSE (verified live):
- BA 11393: bed 88, Aug 22-Sep 13 2026, fee=null, active=true (9 days to check-in)
- BA 11311: bed 84, Jun 28-Aug 22 2026, fee=EUR 3850, active=true (first stay, correct)
- Booking 17980: CONFIRMED, EUR 5331 paid, EUR 0 open
- PMT 17733: EUR 5331, Bank Transfer, Jun 2 2026, xero_payment_id=null (72d unreconciled)

FIX RECIPE (NOT YET RUN):
Step 1 - Confirm fee with Diego/accounts (total paid EUR 5331; BA 11311=EUR 3850; implied remainder EUR 1481)
         UPDATE booking_accommodations SET fee=<AGREED_AMOUNT>, updated_at=NOW() WHERE id=11393;
Step 2 - Reconcile PMT 17733 in Xero: find EUR 5331 receipt Jun 2 2026, match to Pietro invoice bk17980.
         UPDATE payments SET xero_payment_id='<XERO_ID>' WHERE id=17733;
Step 3 - Verify: SELECT id,fee FROM booking_accommodations WHERE id=11393;
         SELECT id,xero_payment_id FROM payments WHERE id=17733;

RISK: money/bookings | Reversible: yes | Blast: 1 student 1 pmt 1 BA
TIME PRESSURE: check-in Aug 22 (9 days)
STATUS: OPEN. Fix NOT RUN. 178th check.