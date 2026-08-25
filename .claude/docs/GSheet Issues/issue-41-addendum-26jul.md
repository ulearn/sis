# Issue 41 — Giampaolo Russo (student 14571) — Capel BA Missing, Check-in 7 Days

Reporter: Diego/ST | Area: Booking / Accomm | Sheet row: 43

## Root cause (verified Sun 26 Jul 2026 UTC)
- BK18180: CONFIRMED, paid=2584.96, total=2584.96
- BA11357 (Aug 2-Sep 6, bed 178, host family, EUR 1250): active=true, correct
- Capel Street BA (Sep 6-Sep 14): still MISSING — only 1 BA on BK18180
- EUR 530 unaccounted (2584.96 - 1250 - 804.96 = 530)
- BC24956 (Gen English AM, Aug 3-Sep 11): starts Aug 3 BH — needs shunt to Aug 4
- Payment 17954 (EUR 2584.96, Jun 26): xeroPaymentId=null — 30 days unreconciled
- Host family check-in: Aug 2 = 7 calendar days away

## Fix recipe (NOT YET RUN)
1. Create Capel BA on BK18180: Sep 6-Sep 14, fee=EUR 530, active=true, correct bed
   (Confirm Capel bed availability before inserting)
2. BC24956 shunt to Aug 4 covered by issue-38 fix (mass shunt of all Aug 3 BCs)
3. Reconcile payment 17954 in Xero, then UPDATE payment SET xeroPaymentId=<id> WHERE id=17954
4. Verify student 14571 appears in Matching after BA created

## Risk
Bookings/Money. EUR 530 paid, no BA record. Check-in Aug 2 (7 days). Pmt unreconciled 30d.

## Status
UNRESOLVED — Host family check-in Aug 2 (7 days). Create Capel BA urgently.

Last checked: Sun 26 Jul 2026 UTC (106th hourly run)