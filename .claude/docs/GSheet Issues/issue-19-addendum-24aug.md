# Issue 19 — Mai Lan Chu — BC 89+90 Stale 94d + EUR 2,385 Payment Gap — 471st check

Reporter: AC | Area: Booking | Sheet row 20

## Root cause (confirmed Mon 24 Aug 2026 UTC)
- BC 89 (Morning IELTS, booking 83): ended 2026-05-22, active = true — 94 days stale, 1 SCA (historical)
- BC 90 (Private Lessons, booking 83): ended 2026-05-22, active = true — 94 days stale, 0 SCAs
- Booking 83: CONFIRMED, confirmed = true, amount paid = EUR 2,629.80 = amount total

Payment anomaly (total received EUR 5,014.80 vs amount total EUR 2,629.80 = EUR 2,385 gap):
- Payment 27: EUR 2,135, Bank Transfer, Mar 2024, xero_payment_id = null (likely migration artifact)
- Payment 17002: EUR 2,629.80, TransferMate, Apr 2026, xero_payment_id = null
- Payment 17019: EUR 250, Stripe, Feb 2026, xero_payment_id = null
All 3 payments have xero_payment_id = null. No change from 470th check (Sun 23 Aug). Now 94 days stale.

## Fix recipe (NOT YET RUN)
Step 1: UPDATE booking_courses SET active = false WHERE id IN (89, 90);
Step 2: Investigate payment 27 (EUR 2,135, Mar 2024) — predates SIS launch, likely Fidelo migration duplicate.
  SELECT booking_id FROM payments WHERE id = 27; — verify it belongs to booking 83.
  Coordinate with Xero to void or reallocate if erroneous.
Step 3: Reconcile payments 17002 + 17019 in Xero once payment 27 is resolved.

## Risk
Money + bookings. EUR 2,385 gap needs investigation before changing payments. BC deactivation low risk.
Blast radius: 2 booking courses, 3 payments, student on booking 83.

## Status
OPEN — 94 days stale. EUR 2,385 payment excess unresolved. Fix NOT RUN.
Last checked: 2026-08-24 UTC (495th run, 471st issue check)
