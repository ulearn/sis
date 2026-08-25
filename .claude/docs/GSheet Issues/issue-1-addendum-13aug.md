# Issue 1 Addendum 13 Aug 2026 (221st check) -- Orphan Payments

Reporter: NM  Area: Cleanup  Sheet row: 2

## Root Cause (221st check -- Thu 13 Aug UTC, no change)
- Payment 4781: EUR 380, Flywire, 2019-08-20, comment ULS771773625 / 21022 -- booking_id = null
- Payment 16988: EUR 339.90, Bank, 2026-04-28 -- booking_id = null; likely Booking 17856 (Margherita Galbusera)
- Payment 16989: EUR 339.90, Bank, 2026-04-28 -- booking_id = null; likely Booking 17857 (Francesca Fassina)
- Payment 17187: EUR 6,151, TransferMate, 2026-05-01, comment ULEARNP2026124 -- booking_id = null
- Booking 17856: CONFIRMED, confirmed = false, amountPaid = 339.90, amountOpen = null
- Booking 17857: CONFIRMED, confirmed = false, amountPaid = 339.90, amountOpen = null
- Booking Courses 24630 + 24631 (General English AM Plus): ended 2026-07-10, active = true -- 34 days stale

## Fix Recipe -- NOT YET RUN

Step 1 (NOT YET RUN): Link Payment 16988 to Booking 17856
  UPDATE payment SET booking_id = 17856 WHERE id = 16988;

Step 2 (NOT YET RUN): Link Payment 16989 to Booking 17857
  UPDATE payment SET booking_id = 17857 WHERE id = 16989;

Step 3 (NOT YET RUN): Set confirmed = true on both bookings
  UPDATE booking SET confirmed = true WHERE id IN (17856, 17857);

Step 4 (NOT YET RUN): Deactivate stale Booking Courses
  UPDATE booking_course SET active = false WHERE id IN (24630, 24631);

Step 5: Payment 17187 (EUR 6,151) -- find booking from comment ULEARNP2026124 in HubSpot; link once confirmed.
Step 6: Payment 4781 (EUR 380, 2019) -- likely pre-SIS orphan; confirm with accounts.

## Risk
Category: payments / bookings. Reversible. Blast radius: 2-4 bookings.

## Status
Fix NOT RUN. 221 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC (221st check)