# Issue 28 — Paola Sthefane Moreira — confirmed=false + Stale BC + Unreconciled Payment — 63rd check

Reporter: AC | Sheet row: 29 | Last checked: 2026-08-23 UTC

## Root Cause (no change since 62nd Sat 22 Aug)
Confirmed via Prisma 2026-08-23 UTC:
- Booking 17850 (Paola): CONFIRMED, confirmed = false (anomaly). amountPaid = null, amountOpen = EUR 321.35.
- Payment 17519: EUR 321.35, paymentDate 2026-05-07, Xero payment ID = null — 108 days unreconciled.
- BC 24624 (Morning General, booking 17850): active = true, ended 2026-06-05 — 79 days stale, 0 class assignments.

## Fix Recipe (NOT YET RUN)
Step 1: UPDATE "Booking" SET confirmed = true, "amountPaid" = 321.35 WHERE id = 17850;
Step 2: UPDATE "BookingCourse" SET active = false WHERE id = 24624;
Step 3: Reconcile Payment 17519 (EUR 321.35) in Xero.
Undo step 1: UPDATE "Booking" SET confirmed = false, "amountPaid" = null WHERE id = 17850;

## Risk
Money + data hygiene. Reversible. Low blast radius (1 student).

## Status
Fix NOT RUN. confirmed = false 63+ days. BC 24624: 79d stale. Payment 17519: 108d Xero null.
Last checked: 2026-08-23 UTC (63rd check).