# Issue 1 - Orphan Payments (219th check, 12 Aug 2026)
Reporter: NM | Area: Cleanup | Sheet row: 2

Wed 12 Aug 2026 UTC. 219th check. No change since 218th check.
Same 4 orphan payments, same booking anomalies, same stale Booking Courses.

Root Cause (confirmed 219th check):

Orphan payments (booking_id = null):
- Payment 4781: EUR 380.00, comment ULS771773625 / 21022 - migration artefact, booking unknown
- Payment 16988: EUR 339.90, 2026-04-28, no comment - likely Booking 17856 (Margherita Galbusera)
- Payment 16989: EUR 339.90, 2026-04-28, no comment - likely Booking 17857 (Francesca Fassina)
- Payment 17187: EUR 6,151.00, comment ULEARNP2026124 - likely agency payment, booking unconfirmed

Booking anomalies:
- Booking 17856: status CONFIRMED, confirmed = false, amountPaid = 339.90, amountOpen = null, total = 339.90
- Booking 17857: status CONFIRMED, confirmed = false, amountPaid = 339.90, amountOpen = null, total = 339.90

Stale Booking Courses (ended 2026-07-10, 33 days stale, still active = true):
- Booking Course 24630 (General English AM Plus)
- Booking Course 24631 (General English AM Plus)

Fix Recipe (NOT YET RUN):

Step 1 - CAUTION: verify amountPaid derivation first. Then:
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;
  UPDATE bookings SET confirmed = true WHERE id = 17856;

Step 2:
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;
  UPDATE bookings SET confirmed = true WHERE id = 17857;

Step 3 - Deactivate stale Booking Courses:
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 4 - Payment 17187 (EUR 6,151): check HubSpot/Xero for invoice ULEARNP2026124 before linking.

Step 5 - Payment 4781 (EUR 380): check Fidelo migration records to identify original booking.

Risk / Category:
- Category: data-hygiene / payments
- Reversible: yes
- Blast radius: 4 payments, 2 bookings, 2 Booking Courses

Status: OPEN - no change since 218th check. Fix NOT RUN.
Last checked: Wed 12 Aug 2026 UTC (219th check)