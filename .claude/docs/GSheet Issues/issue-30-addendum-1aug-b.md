# Issue 30 — Booking Course 104 stale + Payment 17102 Xero unreconciled

Reporter: AC  Area: Booking  Sheet row: 31
Checked: 2026-08-01 UTC (114th hrly, 5th of day)

## Root cause (5th check of day — UNCHANGED)
- Booking course 104 (Morning General Plus, Jun 15-Jun 26 2026): active=true — 36 days stale.
- Booking 94 (student 88 Giulia Avallone): CONFIRMED, confirmed=true, paid EUR 1,151.50, open EUR 0.
- Payment 17102 (EUR 1,151.50, Bank Transfer, created 2026-05-05): xeroPaymentId=null — 88 days unreconciled.
- Milena Vinci: no student record in SIS (paying party / guardian only).

## Fix recipe (NOT YET RUN)

Step 1 - Check class assignments on booking course 104:
  SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 104;

Step 2 - Deactivate booking course 104 (NOT YET RUN):
  UPDATE booking_courses SET active=false WHERE id=104;

Step 3 - Reconcile payment 17102 in Xero (NOT YET RUN):
  Find Xero payment for EUR 1,151.50 (Giulia Avallone / booking 94, May 2026).
  Then: UPDATE payments SET xero_payment_id = '<XERO_ID>' WHERE id=17102;

Step 4 - Verify:
  SELECT id, active FROM booking_courses WHERE id=104;
  SELECT id, xero_payment_id FROM payments WHERE id=17102;

## Risk
Category: bookings / financial / data-hygiene. Reversible: yes. Blast radius: 1 booking course, 1 payment.

## Status: OPEN — booking course 36 days stale; Xero payment 88 days unreconciled
Last checked: 2026-08-01 UTC (114th check, 5th of day)
