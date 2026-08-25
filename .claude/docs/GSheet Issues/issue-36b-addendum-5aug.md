# Issue 36b — Pietro Caccianiga: Payments Unreconciled + Booking 17850 Anomaly (147th check Wed 5 Aug 2026 UTC)
Reporter: AC (Diego) | Area: Accommodation/Booking | Sheet row: 38

## Symptom
Accommodation dates error reported for Pietro (Jun 28 to Sep 13, 11 weeks). Original dates now correct.

## Root Cause (verified 2026-08-05 UTC — no change since Tue 4 Aug)

Pietro Caccianiga (booking 17980):
- Accommodation 11311: bed 84, 2026-06-28 to 2026-09-13, active = true — dates CORRECT, RESOLVED
- Payment 17733: EUR 5,331, booking_id = 17980, xero_payment_id = null — 64 days unreconciled (payment date 2026-06-02)

Paola Sthefane Missias Moreira (booking 17850, student 14456) — separate student, discovered during investigation:
- Booking 17850: status = CONFIRMED, confirmed = false, amount_total = EUR 321.35, amount_paid = null — anomaly
- Booking course 24624 (Morning General, ended 2026-06-05): active = true — 61 days stale, 0 class assignments
- Payment 17519: EUR 321.35, booking_id = 17850, xero_payment_id = null — unreconciled
- No booking accommodations on booking 17850

## Fix Recipe (NOT YET RUN)

Pietro — reconcile payment 17733 in Xero, then update xero_payment_id:
  UPDATE payments SET xero_payment_id = '<xero_id_from_xero>' WHERE id = 17733;

Paola — deactivate stale booking course 24624:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24624;

Paola — if EUR 321.35 covers full booking cost, confirm booking and reconcile payment:
  UPDATE bookings SET confirmed = true, updated_at = NOW() WHERE id = 17850;
  UPDATE payments SET xero_payment_id = '<xero_id_from_xero>' WHERE id = 17519;

## Risk
Category: money, bookings | Reversible: yes | Blast: 2 students, 2 payments, 1 stale BC

## Status: NOT YET RUN | Last checked: 2026-08-05 UTC (147th check)
Pietro accommodation RESOLVED. Outstanding: Xero reconciliation of pmts 17733 (64d) + 17519.