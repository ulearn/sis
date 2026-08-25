# Issue 26 — Ivan Rodriguez — Stale BCs + Unreconciled Payment — 75th check

Reporter: AC | Sheet row: 27 | Last checked: 2026-08-23 UTC

## Root Cause (no change since 74th Sat 22 Aug)
Confirmed via Prisma 2026-08-23 UTC:
- BC 23 (Intensive General 30, booking 22): active = true, ended 2026-05-22 — 93 days stale, 2 class assignments.
- BC 24826 (2 weeks Intensive General 30, booking 18034): active = true, ended 2026-06-19 — 65 days stale, 0 class assignments.
- Booking 18034: PARTIAL, confirmed = false. amountPaid = EUR 845, amountOpen = EUR 250.
- Payment 17683: EUR 845, paymentDate 2026-04-23, Xero payment ID = null — 122 days unreconciled.

## Fix Recipe (NOT YET RUN)
Step 1: Verify SCAs on BC 23:
  SELECT id, week_start, week_end FROM "StudentClassAssignment" WHERE booking_course_id = 23;
  If historical: UPDATE "BookingCourse" SET active = false WHERE id = 23;
Step 2: UPDATE "BookingCourse" SET active = false WHERE id = 24826;
Step 3: Reconcile Payment 17683 (EUR 845) in Xero. Resolve EUR 250 open balance on booking 18034.

## Risk
Bookings + money. Medium (EUR 250 outstanding). BC deactivation reversible.

## Status
Fix NOT RUN. BC 23: 93d (2 SCAs). BC 24826: 65d. Payment 17683: 122d Xero null. EUR 250 open.
Last checked: 2026-08-23 UTC (75th check).