# Issue 28 — Paola Sthefane Missias Moreira — Confirmed False / Stale BC — 65th check

Reporter: AC | Area: Booking / Class | Sheet row 29

## Symptom
Student appears in class but cannot be assigned because SIS shows payment not received.

## Root cause (confirmed Tue 25 Aug 2026 UTC)
- Booking 17850 (Paola Sthefane Missias Moreira): status = CONFIRMED, confirmed = false (anomaly)
- Amount paid = null (DB field), amount total = EUR 321.35
- Payment 17519: EUR 321.35, Bank, 7 May 2026 — xeroPaymentId = null — 110 days unreconciled
- Booking Course 24624: active = true, ended 5 Jun 2026 — 81 days stale, 0 class assignments
- Day 65. Unchanged from 64th check (Mon 24 Aug).

## Fix recipe (NOT YET RUN)
Step 1: UPDATE bookings SET confirmed = true, amount_paid = 321.35 WHERE id = 17850;
Step 2: UPDATE booking_courses SET active = false WHERE id = 24624;
Step 3: Reconcile payment 17519 (EUR 321.35) in Xero.

## Risk
Bookings / money. Reversible. Blast radius: 1 student, 1 booking, 1 unreconciled payment.

## Status
OPEN — Day 65. Booking confirmed = false despite payment on record. Booking Course 24624 81 days stale. Fix NOT RUN.
Last checked: 2026-08-25 UTC (517th run, 65th issue check)