# Issue 1 - Orphan Payments + Stale Booking Courses (Mon 10 Aug - 2nd check)

Reporter: NM | Area: Cleanup | Sheet row: 2

## Root Cause (208th check - Mon 10 Aug 2026 UTC)
4 orphan payments (booking_id = null) remain unchanged. Bookings 17856/17857 unlinked. Booking Courses 24630/24631 still stale at 31 days. No change since 207th check.

Orphan Payments:
- Payment 4781: EUR 380.00, Flywire, 2019-08-20, transaction_id = D20191404, xero_payment_id = null
- Payment 16988: EUR 339.90, Bank Transfer, 2026-04-28, xero_payment_id = null
- Payment 16989: EUR 339.90, Bank Transfer, 2026-04-28, xero_payment_id = null
- Payment 17187: EUR 6,151.00, TransferMate Escrow, 2026-05-01, transaction_id = D2026226, xero_payment_id = null

Unlinked Bookings:
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed = false, amount_paid = 339.90, 0 payments linked
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed = false, amount_paid = 339.90, 0 payments linked

Stale Booking Courses:
- Booking Course 24630 (General English AM Plus, booking TBD): end_date = 2026-07-10, active = true - 31 days stale
- Booking Course 24631 (General English AM Plus, booking TBD): end_date = 2026-07-10, active = true - 31 days stale

## Fix Recipe (NOT YET RUN)
Step 1 - Link payments (16988/16989 match bookings 17856/17857 by EUR 339.90 amount):
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;

Step 2 - Set confirmed = true:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 3 - Deactivate stale booking courses:
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 4 - Payment 4781 (EUR 380, 2019 Flywire): historical orphan. Confirm whether to link to a booking or write off as uncollectable.
Step 5 - Payment 17187 (EUR 6,151 TransferMate Escrow): verify which booking this belongs to before linking.

Step 6 - Verify:
  SELECT id, booking_id, amount FROM payments WHERE id IN (16988, 16989, 4781, 17187);
  SELECT id, confirmed FROM bookings WHERE id IN (17856, 17857);
  SELECT id, active FROM booking_courses WHERE id IN (24630, 24631);

## Risk
Category: money + bookings | Reversible: yes (audit log exists) | Blast radius: EUR 7,210.80 total unreconciled across 4 payments

## Status: OPEN - fix not run; unchanged for 208+ hours
Last checked: 2026-08-10 UTC (208th hourly check)