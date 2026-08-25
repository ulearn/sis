Issue 48 - Multiple Students (Class Assignment and Attendance) - 79th check Sun 9 Aug 2026 UTC
Sheet row: 50

ROOT CAUSE:

Telmuun Enkhsaikhan (student 293):
6 stale booking courses (active=true, ended in past):
  BC 482  AY Afternoon         ended 2025-03-14  513 days stale
  BC 483  AY Afternoon         ended 2025-07-11  394 days stale
  BC 1609 AY Renewal Afternoon ended 2025-12-19  233 days stale
  BC 1610 AY Renewal Afternoon ended 2026-01-09  212 days stale
  BC 1611 AY Renewal Afternoon ended 2026-03-06  156 days stale
  BC 1612 AY Renewal Afternoon ended 2026-05-01  100 days stale

BC 1810 (AY Renewal Morning, 2026-06-29 to 2027-01-01): active=true - CURRENT COURSE, do NOT deactivate.
Telmuun IS enrolled on a current course. Stale BCs prevent appearance in class assignment picker.

Ana Jessica Rosa de Paula Santos (student 766):
Booking 1308: CANCELLED, confirmed=false, amount_paid=EUR 1530, amount_open=null.
Payment 17186: EUR 1280, Bank Transfer, 2026-05-01, xero_payment_id=null.
Payment 17050: EUR 250,  Bank Transfer, 2026-02-17, xero_payment_id=null.
EUR 1530 paid on a cancelled booking. Neither payment Xero-reconciled.

FIX RECIPE (NOT YET RUN):

Step 1 - Deactivate 6 stale BCs for Telmuun (NOT BC 1810):
  UPDATE booking_courses SET active = false WHERE id IN (482, 483, 1609, 1610, 1611, 1612);
  Verify all active=false:
  SELECT id, name, end_date, active FROM booking_courses WHERE id IN (482, 483, 1609, 1610, 1611, 1612);
  Verify BC 1810 still active (current course):
  SELECT id, name, start_date, end_date, active FROM booking_courses WHERE id = 1810;

Step 2 - Resolve Ana Jessica EUR 1530 (booking 1308 CANCELLED):
  Check for active booking: SELECT id, status, confirmed, amount_paid FROM bookings WHERE student_id = 766;
  Option A (Refund): Issue EUR 1530 refund via Bank Transfer. Reconcile in Xero.
  Option B (Reallocate): If active booking exists, move payments 17186 + 17050 to it.

Step 3 - Xero reconciliation after Step 2:
  UPDATE payments SET xero_payment_id = '<xero-id>' WHERE id = 17186;
  UPDATE payments SET xero_payment_id = '<xero-id>' WHERE id = 17050;

RISK: Step 1 low-risk data hygiene. Step 2 financial (needs accounts sign-off). Both reversible.
STATUS: NOT RUN. BC 1810 confirmed active through Jan 2027.
Last checked: 2026-08-09 UTC (79th check)