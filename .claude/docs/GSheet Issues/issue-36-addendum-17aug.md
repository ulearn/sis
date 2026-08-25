# Issue 36 (row 38) — Pietro Caccianiga / BA 11393 fee null (216th check, Mon 17 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 38

## Root cause (verified)
- Booking 17980: CONFIRMED, confirmed=true, EUR 5,331 fully paid
- service_end = 2026-08-21 (4 days) — aligns with course end (BC 24772 ends 21 Aug), correct
- Booking Accommodation 11311: bed 84, 28 Jun to 22 Aug, fee EUR 3,850, active — current stay (ends 5d)
- Booking Accommodation 11393: bed 88 (Capel Street), 22 Aug to 13 Sep, fee = null — check-in 5 days (Sat 22 Aug)
- Payment 17733: EUR 5,331 Bank, xeroPaymentId = null — 76 days unreconciled

## Fix recipe (NOT YET RUN)
Step 1 — URGENT: Set fee on BA 11393 before Sat 22 Aug (check-in):
  Fee = EUR 5,331 total minus EUR 3,850 (BA 11311) = EUR 1,481 remaining.
  Confirm exact amount against invoice/deal before setting.
  UPDATE booking_accommodation SET fee = <confirmed_fee> WHERE id = 11393;

Step 2 — Deactivate BA 11311 on or after 22 Aug:
  UPDATE booking_accommodation SET active = false WHERE id = 11311;

Step 3 — Reconcile Payment 17733 in Xero:
  EUR 5,331 Bank, xeroPaymentId null, 76 days unreconciled.
  Match in Xero and set: UPDATE payment SET xero_payment_id = <id> WHERE id = 17733;

## Risk: accommodation / accounts | Reversible | URGENCY HIGH — check-in Sat 22 Aug (5d)
## Status: OPEN — Fix NOT RUN | Last checked: Mon 17 Aug 2026 UTC (216th check)