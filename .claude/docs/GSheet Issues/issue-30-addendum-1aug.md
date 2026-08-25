# Issue 30 — BC 104 stale + Payment 17102 Xero unreconciled

Reporter: AC  Area: Booking  Sheet row: 31

## Symptom
Booking course 104 (Morning General Plus) ended 26 Jun 2026 but still active. Payment 17102 has no Xero payment ID.

## Root cause (confirmed 2026-08-01 UTC)
- Booking course 104 (Morning General Plus, 15 Jun – 26 Jun 2026): active = true — 36 days stale.
- Booking 94 (student 88 Giulia Avallone): CONFIRMED, confirmed = true, paid = EUR 1,151.50, open = EUR 0 (fully paid).
- Payment 17102 (EUR 1,151.50, created 2026-05-05): xeroPaymentId = null — Xero reconciliation missing.
- Milena Vinci: not a student in SIS (paying party / guardian only).

## Fix recipe (NOT YET RUN)

Step 1 — Check class assignments on BC 104 (NOT YET RUN):
  SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 104;
  -- Safe to deactivate if 0 or all past.

Step 2 — Deactivate BC 104 (NOT YET RUN):
  UPDATE booking_course SET active = false WHERE id = 104;

Step 3 — Reconcile payment 17102 in Xero (NOT YET RUN):
  Find the Xero payment for EUR 1,151.50 (Giulia Avallone / booking 94, May 2026).
  Then: UPDATE payment SET xero_payment_id = "<xeroId>" WHERE id = 17102;

Step 4 — Verify:
  SELECT id, active FROM booking_course WHERE id = 104;
  SELECT id, xero_payment_id FROM payment WHERE id = 17102;

## Risk
Category: bookings / financial / data-hygiene. Reversible: yes. Blast radius: 1 booking course, 1 payment.

## Status: OPEN — BC 36 days stale, Xero unreconciled
Last checked: 2026-08-01 UTC
