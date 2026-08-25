# Issue 19 — Mai Lan Chu (15th check, 17 Aug 2026 UTC)
Reporter: | Area: Booking/Class | Sheet row: 20

## Symptom
Stale booking courses after course end; 3 payments Xero unreconciled.

## Root cause (evidence)
- Booking 83 (Mai Lan Chu): CONFIRMED, amountPaid = EUR 2,629.80, amountOpen = EUR 0
- Booking Course 89 (Morning IELTS, bk 83): ended 2026-05-22, 87d stale, active = true
- Booking Course 90 (Private Lessons, bk 83): ended 2026-05-22, 87d stale, active = true
- 3 payments all xeroPaymentId = null:
  - Payment 27: EUR 2,135.00, Bank Transfer, 2024-03-19 (legacy)
  - Payment 17019: EUR 250.00, Stripe, 2026-02-12
  - Payment 17002: EUR 2,629.80, TransferMate, 2026-04-08
  - Total: EUR 5,014.80 vs amountPaid EUR 2,629.80 — EUR 2,385 gap
  - Payment 27 (2024) may be from a prior booking period

## Fix recipe (NOT YET RUN)

Step 1 — Check SCAs before deactivating BCs:
  SELECT COUNT(*) FROM StudentClassAssignment WHERE bookingCourseId IN (89, 90);

Step 2 — Deactivate Booking Course 89:
  UPDATE BookingCourse SET active = false, updatedAt = NOW() WHERE id = 89;

Step 3 — Deactivate Booking Course 90:
  UPDATE BookingCourse SET active = false, updatedAt = NOW() WHERE id = 90;

Step 4 — Reconcile 3 payments in Xero (accounts team):
  - Payment 27 (EUR 2,135, Bank, Mar 2024): match Xero migration invoice
  - Payment 17019 (EUR 250, Stripe, Feb 2026): find Xero invoice
  - Payment 17002 (EUR 2,629.80, TransferMate, Apr 2026): find Xero invoice

Step 5 — Clarify EUR 2,385 gap with accounts.

## Risk / Category
Bookings + money | Reversible | Blast radius: 1 student (Mai Lan Chu), Xero reconciliation

## Status
OPEN — fix NOT RUN. BCs 89+90 87d stale. 3 payments Xero null (EUR 5,014.80 total). EUR 2,385 gap.
Last checked: 2026-08-17 UTC (15th check)