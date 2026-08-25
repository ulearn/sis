ISSUE 17 — Ana Jessica Rosa de Paula Santos: cancelled booking, unreconciled payments
=======================================================================================

Area: Booking  Row: 18  Checked: 2026-08-01 UTC (16th hrly, 3rd of day)

SYMPTOM
-------
Booking cancelled but EUR 1,530 received. Payments unreconciled in Xero after 88 days.

ROOT CAUSE / DB STATE (confirmed 2026-08-01 UTC, 3rd check)
------------------------------------------------------------
- Booking 1308 (Ana Jessica Rosa de Paula Santos): status = CANCELLED, confirmed = false.
- Amount paid = EUR 1,530 / EUR 1,530 (fully paid before cancellation).
- BC1350 (Academic Year Afternoon, May 25-Nov 13 2026): active=true - STALE (active despite CANCELLED booking).
- Payment 17186: EUR 1,280, Bank Transfer, xeroPaymentId = null - 88 days unreconciled.
- Payment 17050: EUR 250, Bank Transfer, xeroPaymentId = null - 88 days unreconciled.
- Decision needed: was cancellation intentional? If reinstating, SCA also needed.

FIX RECIPE (NOT YET RUN)
------------------------

OPTION A - Reinstate booking (if cancellation was accidental):
  Step 1 - Set booking active (NOT YET RUN):
    UPDATE bookings SET status = 'CONFIRMED', confirmed = true WHERE id = 1308;
  Step 2 - Create SCA for BC1350 (NOT YET RUN):
    INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end, created_at)
    VALUES (<STUDENT_ID>, 1350, <CLASS_ID>, '2026-08-04', '2026-11-13', NOW());
  Step 3 - Reconcile PMT17186 + PMT17050 in Xero.

OPTION B - Confirm cancellation + process refund/write-off:
  Step 1 - Deactivate stale BC1350 (NOT YET RUN):
    UPDATE booking_course SET active = false WHERE id = 1350;
  Step 2 - Mark payments reconciled/refunded in Xero.
  Step 3 - Confirm EUR 1,530 was refunded to student.

Step N - Verify (either option):
  SELECT status, confirmed FROM bookings WHERE id = 1308;
  SELECT id, amount, xero_payment_id FROM payments WHERE booking_id = 1308;
  SELECT id, active FROM booking_course WHERE id = 1350;

RISK
----
Category: money/bookings. Reversible: yes (either option). Blast radius: 1 student.
EUR 1,530 unreconciled - needs Xero action regardless of route taken.

STATUS: OPEN - 88 days unreconciled. Needs Neil decision: reinstate or confirm cancel.
Last checked: 2026-08-01 UTC (3rd check of day)
