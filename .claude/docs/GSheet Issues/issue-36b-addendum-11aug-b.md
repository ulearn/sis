# Issue 36b Addendum 11 Aug 2026-b (160th check)

Tue 11 Aug 2026 UTC. No change since 159th check.

## Current State

- Booking 17980 (Pietro Caccianiga, student 14521): CONFIRMED, confirmed = true, EUR 5,331 paid, EUR 0 open
- Booking Course 24772 (General English AM): ends 2026-08-21 (10 days), 2 class assignments -- class issue RESOLVED
- Payment 17733: EUR 5,331, xeroPaymentId = null -- Xero reconciliation still pending (~70+ days)
- Payment 17519 (EUR 321.35): belongs to booking 17850, NOT booking 17980 (correction confirmed)

## Fix Recipe (NOT YET RUN)

1. In Xero: locate the EUR 5,331 payment against Pietro's invoice (booking 17980).
2. Match/reconcile payment 17733 in Xero.
3. Once reconciled, update xeroPaymentId on payment 17733 in Postgres.
4. Course ends 2026-08-21 -- reconcile before then for clean books.

## Risk / Category

- Category: accounts / Xero reconciliation
- Reversible: yes
- Blast radius: single payment EUR 5,331
- BC 24772 ends Aug 21 -- 10 days remaining

Status: Xero reconciliation pending. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (160th check)