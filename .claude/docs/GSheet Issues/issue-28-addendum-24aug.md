# Issue 28 — Paola Sthefane Moreira — confirmed=false + Stale BC + Unreconciled Payment — 64th check

Reporter: AC | Area: Booking | Sheet row 29

## Root cause (confirmed Mon 24 Aug 2026 UTC)
- Booking 17850 (student 14456, Paola Sthefane Moreira): status = CONFIRMED, confirmed = false (anomaly)
- amount_paid = null, amount_total = EUR 321.35, amount_open = EUR 321.35
  Payment 17519 exists (EUR 321.35, Bank, 2026-05-07) but not reflected in booking amount_paid field
- Payment 17519: EUR 321.35, xero_payment_id = null — 109 days unreconciled (since 7 May 2026)
- BC 24624 (Morning General, booking 17850): ended 2026-06-05, active = true — 80 days stale, 0 SCAs
- Document 44 (template 3): ISSUED
- No change from 63rd check (Sun 23 Aug). Day counts +1.

## Fix recipe (NOT YET RUN)
Step 1: UPDATE bookings SET confirmed = true, amount_paid = 321.35 WHERE id = 17850;
  (Undo: UPDATE bookings SET confirmed = false, amount_paid = null WHERE id = 17850;)
Step 2: UPDATE booking_courses SET active = false WHERE id = 24624;
Step 3: Reconcile payment 17519 (EUR 321.35, 7 May 2026) in Xero.

## Risk
Money + data hygiene. Reversible. Low blast radius: 1 student, 1 booking, 1 payment.

## Status
OPEN — confirmed = false 64+ days. BC 24624: 80d stale. Payment 17519: 109d Xero null. Fix NOT RUN.
Last checked: 2026-08-24 UTC (495th run, 64th issue check)
