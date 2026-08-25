Issue 30 — Giulia Avallone / Milena Vinci: Stale Booking Course + Xero
117th check Wed 5 Aug 2026 UTC
Reporter: pg | Area: Booking | Sheet row: 31

Symptom
Booking course 104 remains active 40 days after end. Payment 17102 unreconciled in Xero for 145 days.

Root Cause (verified 2026-08-05, 117th check — UNCHANGED)
- Booking course 104 (Morning General Plus, Jun 15-Jun 26 2026): active = true — 40 days stale.
- Booking 94 (Giulia Avallone, student 88): CONFIRMED, confirmed = true, EUR 1,151.50 paid.
- Payment 17102: EUR 1,151.50, xeroPaymentId = null, paymentDate 2026-03-13 — 145 days unreconciled.

Fix Recipe (NOT YET RUN)

Step 1 — Deactivate stale booking course:
  UPDATE "BookingCourse" SET active = false, updated_at = NOW() WHERE id = 104;

Step 2 — Reconcile payment 17102 in Xero:
  Find EUR 1,151.50 receipt dated 2026-03-13 for booking 94.
  Then: UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17102;

Step 3 — Verify:
  SELECT id, active FROM "BookingCourse" WHERE id = 104;
  SELECT xero_payment_id FROM payments WHERE id = 17102;

Risk / Category
bookings, payments | Reversible: yes | Student 88 only

Status: NOT YET RUN | Last checked: 2026-08-05 UTC (117th check)
BC 104 stale 40d. Payment 17102 unreconciled 145d (since Mar 13).