Issue 48 - Class assignment / attendance: Telmuun, Ana Jessica, others - 80th check Sun 9 Aug 2026 UTC
Sheet row: 50

STATUS: UNCHANGED. Hash changed (B/F/G updated in sheet). Data confirmed by fresh query.

TELMUUN ENKHSAIKHAN (student 293):
6 stale Booking Courses confirmed still active:
  BC 482  Academic Year Afternoon      ended 2025-03-14 (513 days stale)
  BC 483  Academic Year Afternoon      ended 2025-07-11 (394 days stale)
  BC 1609 AY Renewal Afternoon         ended 2025-12-19 (233 days stale)
  BC 1610 AY Renewal Afternoon         ended 2026-01-09 (212 days stale)
  BC 1611 AY Renewal Afternoon         ended 2026-03-06 (156 days stale)
  BC 1612 AY Renewal Afternoon         ended 2026-05-01 (100 days stale)
Booking Course 1810 (AY Renewal Morning, 2026-06-29 to 2027-01-01): active=true - CURRENT, do NOT deactivate.

ANA JESSICA ROSA DE PAULA SANTOS (student 766):
Booking 1308: CANCELLED, confirmed=false, EUR 1,530 paid on cancelled booking.
Payment 17186: EUR 1,280, Bank Transfer, 2026-05-01, xero_payment_id=null.
Payment 17050: EUR 250, Bank Transfer, 2026-02-17, xero_payment_id=null.
Total EUR 1,530 = amountPaid. Needs refund or reallocation to an active booking.

FIX RECIPE (NOT YET RUN):

Step 1 - Deactivate 6 stale BCs for Telmuun (NOT BC 1810):
  UPDATE booking_courses SET active = false WHERE id IN (482, 483, 1609, 1610, 1611, 1612);
  Verify BC 1810 still active: SELECT id, name, start_date, end_date, active FROM booking_courses WHERE id = 1810;

Step 2 - Resolve Ana Jessica EUR 1,530 (booking 1308 CANCELLED):
  Check active bookings: SELECT id, status, confirmed, amount_paid FROM bookings WHERE student_id = 766;
  Option A (Refund): Issue EUR 1,530 refund via Bank Transfer; reconcile in Xero.
  Option B (Reallocate): If active booking exists, move payments 17186 + 17050 to it.

Step 3 - Xero reconciliation (after Step 2 decision):
  UPDATE payments SET xero_payment_id = '<xero-id>' WHERE id IN (17186, 17050);

RISK: Step 1 low-risk data hygiene | Step 2 financial (accounts sign-off needed) | Both reversible.
STATUS: NOT RUN
Last checked: 2026-08-09 UTC (80th check)
