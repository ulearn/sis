# Issue 36b Addendum 12 Aug 2026 (163rd check)

Reporter: AC | Area: Booking / Accomm | Row: 38

Wed 12 Aug 2026 UTC. 163rd check. No change since 162nd. BC ends Aug 21 (9 days). Xero still unreconciled.

## Symptom

Accommodation dates error for Pietro Caccianiga (student 14521).

## Root Cause

Payment 17733 (EUR 5,331) has xeroPaymentId = null -- not yet reconciled in Xero. Booking Accommodation 11393 has fee = null.
BC 24772 ends 21 Aug 2026 (9 days). Student transitions to BA 11393 from 22 Aug. Fee gap must be set before handover.

### DB evidence (verified Wed 12 Aug 2026)
- Booking 17980: CONFIRMED, EUR 5,331 paid, EUR 0 open, service end 21 Aug 2026
- BC 24772 (General English AM): active, ends 21 Aug 2026 (9 days remaining)
- BA 11311: 28 Jun - 22 Aug 2026, fee = EUR 3,850, active = true
- BA 11393: 22 Aug - 13 Sep 2026, fee = null, active = true
- Payment 17733: EUR 5,331, xeroPaymentId = null (70 days unreconciled)

## Fix Recipe (NOT YET RUN)

Step 1 -- Reconcile payment 17733 (EUR 5,331) in Xero (NOT YET RUN):
  Open Xero -> Payments -> match payment 17733 (EUR 5,331) to invoice for booking 17980.

Step 2 -- Set BA 11393 fee (NOT YET RUN):
  UPDATE booking_accommodations SET fee = [correct amount] WHERE id = 11393;
  Confirm correct fee with accounts before running. BA 11393 covers 22 Aug - 13 Sep 2026 (3 weeks).

Step 3 -- Optional: deactivate any stale BAs if applicable.

## Risk / Category
- Category: payments / accommodation
- Reversible: yes (Xero reconciliation can be undone; DB update reversible)
- Blast radius: single student, one payment, one BA fee record
- APPROACHING: BC ends 21 Aug (9 days) -- set BA 11393 fee before handover date

Status: Open. Fix NOT YET RUN.
Last checked: Wed 12 Aug 2026 UTC (163rd check)