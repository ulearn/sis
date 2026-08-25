# Issue 30 — Giulia Avallone / Milena Vinci (bk94 stale BC + Xero lag)

Reporter: AC | Area: Booking | Sheet row: 31

## Root cause (15 Aug 2026 UTC — 128th check, unchanged from 14 Aug)

- Booking 94: CONFIRMED, fully paid EUR 1,151.50, amountOpen = 0
- Booking Course 104 (Morning General Plus, ended 2026-06-26): active = true, 50 days stale
  - SCA 270: class 12, week 2026-06-15 to 2026-06-26 — historical, within period, safe to deactivate
- Payment 17102 (booking 94): EUR 1,151.50, xeroPaymentId = null — 155 days unreconciled (paid 2026-03-13)
- Payment 945 (booking 79, separate): EUR 4,231, xeroPaymentId = null — 197 days unreconciled (paid 2026-01-30). Confirmed on booking 79, not 94.

## Fix recipe (NOT YET RUN)

1. UPDATE booking_course SET active = false WHERE id = 104; -- SCA 270 is historical
2. Reconcile Payment 17102 (EUR 1,151.50, booking 94) in Xero
3. Reconcile Payment 945 (EUR 4,231, booking 79) in Xero — note separate booking

Reversible. Low blast radius — course ended Jun 26.

## Status

Unchanged. Payment 945 confirmed on booking 79. Fix NOT RUN.
Last checked: 15 Aug 2026 UTC (128th check)
