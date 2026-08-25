# Issue 36 (row 38) — Pietro Caccianiga / BA 11393 fee + Xero

Reporter: KC | Sheet row: 38 | Last checked: 2026-08-13 UTC (176th hourly check)

## Root cause
- BA 11393: bed 88 (A2/Room 3, property A2), start 2026-08-22, end 2026-09-13, active=true
- Fee = null — unset day 6+
- Payment 17733: EUR 5,331, Bank, 2026-06-02, booking 17980, xero_payment_id=null (72 days unreconciled)
- Check-in 9 days away (22 Aug 2026)

## Fix recipe (NOT YET RUN)
Step 1: Set fee on BA 11393:
  Via SIS admin: Accommodation > Pietro Caccianiga > BA 11393 > set fee (confirm from deal/invoice)
  DB: UPDATE booking_accommodations SET fee = <confirmed_amount> WHERE id = 11393;
Step 2: Reconcile Payment 17733 in Xero:
  Locate EUR 5,331 bank receipt ~2 Jun 2026 in Xero, match/reconcile.
  DB: UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17733;

## Status
Open — fee null (day 6). Check-in Aug 22 (9 days). Fix NOT RUN.
Last checked: 2026-08-13 UTC (176th hourly check)