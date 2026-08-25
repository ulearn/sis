## Issue 48 -- Multiple Students: Stale Booking Courses + Orphan Payments (51st check Tue 4 Aug 2026 UTC)
Reporter: AC | Area: Attendance/Classes | Sheet row: 50

## Symptom
Students (Fassina, Galbusera, others) cannot be found for class assignment. Two EUR 339.90 payments have no booking_id.

## Root Cause (verified 2026-08-04 UTC, 51st check -- UNCHANGED)

Stale booking courses (root cause of class assignment failures):
- Booking course 24630 (General English AM Plus, ended 2026-07-10, booking 17857 -- Fassina): active = true -- 25 days stale.
- Booking course 24631 (General English AM Plus, ended 2026-07-10, booking 17856 -- Galbusera): active = true -- 25 days stale.
- Booking course 25006 (General English AM Plus, ended 2026-08-03, booking 18228 -- Marina Larripa): active = true -- 1 day stale.

Orphan payments (no booking_id):
- Payment 16988 (EUR 339.90): booking_id = null, xero_payment_id = null, created 2026-04-28 -- 98 days unlinked.
- Payment 16989 (EUR 339.90): booking_id = null, xero_payment_id = null, created 2026-04-28 -- 98 days unlinked.
- Amounts match Fassina (booking 17857) and Galbusera (booking 17856) at EUR 339.90 each.

Booking 18228 (Marina Larripa): CONFIRMED, confirmed = true -- booking OK; only BC 25006 needs deactivation.

## Fix Recipe (NOT YET RUN)

Step 1 -- Deactivate stale booking courses:
  UPDATE booking_course SET active = false WHERE id IN (24630, 24631, 25006);

Step 2 -- Link orphan payments to bookings:
  Verify Fassina = booking 17857, Galbusera = booking 17856, then:
  UPDATE payments SET booking_id = 17857 WHERE id = 16988;
  UPDATE payments SET booking_id = 17856 WHERE id = 16989;

Step 3 -- Reconcile orphan payments in Xero:
  Find EUR 339.90 x2 receipts dated 2026-04-28 in Xero. Match to invoices, then update xero_payment_id.

Step 4 -- Verify:
  SELECT id, active FROM booking_course WHERE id IN (24630, 24631, 25006);
  SELECT id, booking_id, xero_payment_id FROM payments WHERE id IN (16988, 16989);

## Risk / Category
bookings, payments, data-hygiene | Reversible: yes | Students 14560/14561 + Marina Larripa

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (51st check)
BCs 24630+24631 stale 25 days (Fassina/Galbusera). BC 25006 stale 1 day. Orphan payments 98 days unlinked.