# Issue 36b — Pietro Caccianiga: Pmt Unreconciled + Booking 17850 Anomaly (Tue 4 Aug 2026 UTC)
Reporter: AC (Diego) | Area: Accommodation/Booking | Sheet row: 38

## Symptom
Accommodation dates error (Jun 28 to Sep 13, 11 weeks). System would not allow date change.

## Root Cause (confirmed 2026-08-04 UTC)

CORRECTION from prior H (which incorrectly stated Pietro has bookings 17850+17980):
- Booking 17980 belongs to Pietro Caccianiga — this is the correct booking for this issue.
- Booking 17850 belongs to Paola Sthefane Missias Moreira (student 14456) — separate student.

Pietro Caccianiga (booking 17980):
- Accommodation 11311: bed 84, 2026-06-28 to 2026-09-13, active=true, fee=EUR 3,850 — DATES CORRECT, RESOLVED.
- Payment 17733: EUR 5,331, booking_id=17980, payment_date=2026-06-02, xero_payment_id=null — 63 days unreconciled.

Paola Sthefane Missias Moreira (booking 17850, student 14456):
- Booking 17850: CONFIRMED, confirmed=false, amount_paid=null, amount_open=EUR 321.35.
- Booking course 24624 (Morning General, 2026-05-18 to 2026-06-05): active=true — 60 days stale, 0 SCAs.
- Payment 17519: EUR 321.35, booking_id=17850, payment_date=2026-05-07, xero_payment_id=null.
- No booking accommodations on booking 17850.

## Fix Recipe (NOT YET RUN)
Pietro — reconcile pmt 17733 in Xero, then:
  UPDATE payments SET xero_payment_id='<xero_id>' WHERE id=17733;

Paola — deactivate stale BC 24624:
  UPDATE booking_courses SET active=false WHERE id=24624;

Paola — if EUR 321.35 covers full booking cost, confirm booking:
  UPDATE bookings SET confirmed=true WHERE id=17850;
  UPDATE payments SET xero_payment_id='<xero_id>' WHERE id=17519;

## Risk: money, bookings | Reversible: yes | 2 students, 2 pmts, 1 stale BC

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC. Pietro accommodation RESOLVED. Outstanding: Xero reconciliation.