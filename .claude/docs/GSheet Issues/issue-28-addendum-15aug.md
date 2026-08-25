# Issue 28 — Paola Sthefane Moreira (bk17850 confirmed=false)

Reporter: PG | Area: Booking/Class | Sheet row: 29

## Root cause (15 Aug 2026 UTC — 52nd check, unchanged from 14 Aug)

- Booking 17850: status = CONFIRMED, confirmed = false (anomaly), amountPaid = null, amountOpen = EUR 321.35
- Payment 17519: EUR 321.35, Bank, 2026-05-07, xeroPaymentId = null (100 days unreconciled)
- Booking Course 24624 (Morning General, 18 May - 5 Jun 2026): active = true, 71 days stale, 0 class assignments
- Last booking update: 2026-07-08

## Fix recipe (NOT YET RUN)

1. UPDATE booking SET confirmed = true, amount_paid = 321.35 WHERE id = 17850;
2. UPDATE booking_course SET active = false WHERE id = 24624;
3. Reconcile Payment 17519 in Xero (manual)

Reversible. Low blast radius — course ended Jun 5.

## Status

Unchanged. Fix NOT RUN.
Last checked: 15 Aug 2026 UTC (52nd check)
