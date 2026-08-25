# Issue 36b Addendum 11 Aug 2026-c (161st check)

Tue 11 Aug 2026 UTC. No change since 160th.

## Current State

- Booking 17980 (Pietro Caccianiga, student 14521): CONFIRMED, EUR 5,331 paid, EUR 0 open, service end 21 Aug
- BC 24772 (General English AM): ends 21 Aug 2026 (10 days), 2 class assignments -- class OK
- Payment 17733 (EUR 5,331, bank, 2 Jun 2026): xeroPaymentId = null -- 70 days without Xero reconciliation
- BA 11393 (bed 88, 22 Aug-13 Sep 2026): fee = null -- second accommodation period has no fee

## Fix (NOT YET RUN)

1. In Xero: locate EUR 5,331 payment for Pietro invoice (booking 17980), reconcile it
2. After reconciliation, set xeroPaymentId on payment 17733 in Postgres
3. Set fee on BA 11393 (Diego to confirm amount for Aug 22-Sep 13 period)
4. Reconcile before Aug 21 (service end) for clean books

Risk: accounts/Xero. Reversible. EUR 5,331 single payment.
Status: Open. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (161st check)