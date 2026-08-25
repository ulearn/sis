## Issue 26 -- Ivan Rodriguez: Stale Booking Courses + Open Balance (51st check Tue 4 Aug 2026 UTC)
Reporter: pg | Area: Booking/Class | Sheet row: 27

## Symptom
Stale booking courses keep student visible in class assignment; booking has EUR 250 unpaid; payment unreconciled in Xero.

## Root Cause (verified 2026-08-04 UTC, 51st check -- UNCHANGED)
- Booking course 23 (Intensive General 30, ended 2026-05-22, booking 22): active = true -- 74 days stale.
- Booking course 24826 (2 wks Intensive General 30, ended 2026-06-19, booking 18034): active = true -- 46 days stale.
- Booking 18034 (student 14532, Ivan Rodriguez): PARTIAL, confirmed = false, total EUR 1,095, open EUR 250.
- Payment 17683 (EUR 845): paymentDate 2026-04-23, booking 18034, xeroPaymentId = null -- 103 days unreconciled.

## Fix Recipe (NOT YET RUN)

Step 1 -- Deactivate stale booking courses:
  UPDATE booking_course SET active = false WHERE id IN (23, 24826);

Step 2 -- Chase EUR 250 outstanding on booking 18034:
  Contact student/agency. Once paid, record payment and update amountOpen.

Step 3 -- Reconcile payment 17683 in Xero:
  Find EUR 845 receipt dated 2026-04-23 for booking 18034.
  Then: UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17683;

Step 4 -- Verify:
  SELECT id, active FROM booking_course WHERE id IN (23, 24826);
  SELECT amount_open, status FROM bookings WHERE id = 18034;
  SELECT xero_payment_id FROM payments WHERE id = 17683;

## Risk / Category
bookings, payments | Reversible: yes | Student 14532 only

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (51st check)
74 days stale on BC 23. EUR 250 open. Payment 17683 unreconciled 103 days.