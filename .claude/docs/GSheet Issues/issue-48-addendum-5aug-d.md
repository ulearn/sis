# Issue 48 - Attendance / Class Assignment: Fassina, Galbusera + Others (55th check)

Reporter: AC | Area: Attendance/classes | Sheet row 50 | Last checked: 2026-08-05 UTC (55th check)

State - verified 55th check Wed 5 Aug 2026 UTC
No change from 54th check. Overlaps Issue 1 for orphan payments and stale booking courses.

Stale booking courses:
- BC 25006 (General English AM Plus, ended 2026-08-03): active = true, 2 days stale, 2 class assignments - safe to deactivate
- BC 24630 (Francesca Fassina, General English AM Plus, ended 2026-07-10): active = true, 26 days stale, 0 class assignments
- BC 24631 (Margherita Galbusera, General English AM Plus, ended 2026-07-10): active = true, 26 days stale, 0 class assignments

Orphan payments / partially-reconciled bookings:
- Payment 16988 (EUR 339.90, 2026-04-28): booking_id = null, xero_payment_id = null - 108 days orphaned
- Payment 16989 (EUR 339.90, 2026-04-28): booking_id = null, xero_payment_id = null - 108 days orphaned
- Booking 17856 (Margherita Galbusera): status = CONFIRMED, confirmed = false, amount_paid = EUR 339.90
- Booking 17857 (Francesca Fassina): status = CONFIRMED, confirmed = false, amount_paid = EUR 339.90
- Amounts match orphan payments but booking_id on payment records remains null

Root Cause:
Fassina and Galbusera courses ended 10 July; BCs 24630/24631 never deactivated. Payments appear to have been
manually entered on booking records without formally linking the payment records (booking_id = null).
The confirmed = false flag on both bookings is a secondary anomaly.

Fix Recipe (NOT YET RUN - see also issue-1-addendum-5aug-d.md):

Step 1 - Deactivate stale booking courses:
  UPDATE booking_courses SET active = false WHERE id IN (25006, 24630, 24631);

Step 2 - Link orphan payments (confirm mapping before running):
  UPDATE payments SET booking_id = 17857 WHERE id = 16988;
  UPDATE payments SET booking_id = 17856 WHERE id = 16989;

Step 3 - Fix confirmed flag:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Risk: data-hygiene / money | Reversible | Blast radius: 2 students, 3 stale BCs, EUR 679.80 orphaned.
Status: OPEN - 55th check 2026-08-05 UTC. NOT YET RUN.