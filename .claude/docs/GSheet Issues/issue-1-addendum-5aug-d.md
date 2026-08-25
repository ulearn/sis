# Issue 1 - Orphan Payments + Stale Booking Courses (150th check)

Reporter: NM | Area: Cleanup | Sheet row 2 | Last checked: 2026-08-05 UTC (150th check)

State - verified 150th check Wed 5 Aug 2026 UTC
No change from 149th check. All items unchanged.

Orphan payments (4 - 108+ days orphaned):
- Payment 16988: EUR 339.90, paymentDate 2026-04-28, booking_id = null, xero_payment_id = null, transactionId = null
- Payment 16989: EUR 339.90, paymentDate 2026-04-28, booking_id = null, xero_payment_id = null, transactionId = null
- Payment 17187: EUR 6,151, paymentDate 2026-05-01, transactionId = D2026226, xero_payment_id = null, booking_id = null
- Payment 4781: EUR 380, paymentDate 2019-08-20, transactionId = D20191404, xero_payment_id = null, booking_id = null (legacy 2019)

Partially-reconciled bookings:
- Booking 17856 (Margherita Galbusera, student 14461): status = CONFIRMED, confirmed = false, amount_paid = EUR 339.90, amount_open = null
- Booking 17857 (Francesca Fassina, student 14462): status = CONFIRMED, confirmed = false, amount_paid = EUR 339.90, amount_open = null
- Amount paid matches orphan payments 16988/16989 exactly but no formal booking_id link on either payment.
- amount_open now returns null (previously zero) - likely cosmetic.

Stale booking courses:
- BC 25006 (General English AM Plus, ended 2026-08-03): active = true, 2 days stale, 2 class assignments - safe to deactivate
- BC 24630 (General English AM Plus, ended 2026-07-10): active = true, 26 days stale, 0 class assignments
- BC 24631 (General English AM Plus, ended 2026-07-10): active = true, 26 days stale, 0 class assignments

Fix Recipe (NOT YET RUN):

Step 1 - Link orphan payments to bookings (confirm mapping before running):
  UPDATE payments SET booking_id = 17857 WHERE id = 16988;
  UPDATE payments SET booking_id = 17856 WHERE id = 16989;

Step 2 - Fix confirmed = false on bookings 17856 and 17857:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 3 - Deactivate stale booking courses:
  UPDATE booking_courses SET active = false WHERE id IN (25006, 24630, 24631);

Step 4 - Resolve payment 17187 (EUR 6,151, TransferMate, D2026226): find correct booking and set booking_id.
Step 5 - Resolve payment 4781 (EUR 380, 2019 legacy): discuss with Neil, likely write-off.

Risk: money / bookings | Reversible | Blast radius: low (4 payments, 3 BCs, 2 bookings).
Status: OPEN - 150th check 2026-08-05 UTC. NOT YET RUN.