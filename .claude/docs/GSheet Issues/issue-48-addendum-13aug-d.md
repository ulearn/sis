# Issue 48 — Telmuun Enkhsaikhan / BC 1810 payment discrepancy (13 Aug d)

Reporter: AC | Sheet row: 50 | Last checked: 2026-08-13 UTC (108th hourly check)

## Root cause
- BC 1810 (Academic Year Renewal Morning, student 293): start 2026-06-29, end 2027-01-01, active=true — 0 SCAs (45 days)
- Booking 1624: PARTIAL, confirmed=false, amount_paid=EUR 1,406, amount_open=EUR 250
- NEW: amount_paid=1406 but only 1 payment linked to bk1624:
    Payment 17956: EUR 100, Bank, 2026-03-31, xero_payment_id=null — EUR 1,306 gap unexplained
- All 3 Telmuun payments (across all bookings) have xero_payment_id=null:
    Payment 259: EUR 2,785, Bank, 2024-10-15, booking 467
    Payment 884: EUR 220, Stripe, 2025-08-22, booking 1466
    Payment 17956: EUR 100, Bank, 2026-03-31, booking 1624
- Booking 1624 last updated 2026-08-05 (8 days ago)
- Likely Fidelo migration gap: bulk EUR 1,306 not carried over as payment record

## Fix recipe (NOT YET RUN)
Step 1: Investigate EUR 1,306 discrepancy via Hub fins/ exports for student 293.
  If payment found, create payment record on booking 1624.
Step 2: Assign BC 1810 to AM class once payment confirmed.
  Set bk1624 confirmed=true, then assign via SIS admin.
Step 3: Reconcile payments 259, 884, 17956 in Xero.

## Status
Open — 0 SCAs (45 days). EUR 1,306 payment gap newly identified. Fix NOT RUN.
Last checked: 2026-08-13 UTC (108th hourly check)