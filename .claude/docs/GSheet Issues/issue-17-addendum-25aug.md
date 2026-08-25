# Issue 17 — Ana Jessica Rosa de Paula Santos — Cancelled Booking / Active BC — 44th check

Reporter: AC | Area: Booking | Sheet row 18

## Symptom
Booking shows as cancelled in SIS but Booking Course 1350 is still active with end date Nov 27 2026.

## Root cause (confirmed Tue 25 Aug 2026 UTC)
- Booking 1308 (Ana Jessica Rosa de Paula Santos): status = CANCELLED, confirmed = false, amount paid = EUR 1,530
- Payment 17186: EUR 1,280 — xeroPaymentId = null (unreconciled)
- Payment 17050: EUR 250 — xeroPaymentId = null (unreconciled)
- Booking Course 1350 (Academic Year Afternoon): active = true, ends 27 Nov 2026 — 0 class assignments
- Note (21 Aug): BC 1350 end date was extended — reason unclear; booking itself remains CANCELLED
- Day 44. Unchanged from 43rd check (Mon 24 Aug).

## Fix recipe (NOT YET RUN)
Step 1: Confirm with staff whether booking 1308 was intentionally cancelled or in error.
  - If intentionally cancelled: deactivate BC 1350 (UPDATE booking_courses SET active = false WHERE id = 1350)
  - If cancelled in error: reinstate booking 1308 status
Step 2: Reconcile payments 17186 (EUR 1,280) and 17050 (EUR 250) in Xero, or record refund if cancelled.

## Risk
Bookings / money. Reversible. Blast radius: 1 booking, 2 unreconciled payments. Staff input needed before running.

## Status
OPEN — Booking CANCELLED, Booking Course 1350 still active, EUR 1,530 in 2 unreconciled payments. Fix NOT RUN.
Last checked: 2026-08-25 UTC (517th run, 44th issue check)