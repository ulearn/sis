Issue 1 Addendum 13 Aug 2026 (223rd check) -- Orphan Payments

Reporter: NM  Area: Cleanup  Sheet row: 2

Root Cause (223rd check -- Thu 13 Aug UTC, 237th hourly run, no change)
- Payment 4781: EUR 380, Flywire, 2019-08-20, comment ULS771773625 / 21022 -- booking_id = null
- Payment 16988: EUR 339.90, Bank, 2026-04-28 -- booking_id = null; likely Booking 17856 (Margherita Galbusera)
- Payment 16989: EUR 339.90, Bank, 2026-04-28 -- booking_id = null; likely Booking 17857 (Francesca Fassina)
- Payment 17187: EUR 6,151, TransferMate Escrow, 2026-05-01, comment ULEARNP2026124 -- booking_id = null
- Booking 17856: CONFIRMED, confirmed = false, amountPaid = 339.90, amountOpen = null
- Booking 17857: CONFIRMED, confirmed = false, amountPaid = 339.90, amountOpen = null
- Booking Courses 24630 + 24631 (General English AM Plus): ended 2026-07-10, active = true -- 34 days stale

Fix Recipe -- NOT YET RUN
  Step 1: UPDATE payment SET booking_id = 17856 WHERE id = 16988;
  Step 2: UPDATE payment SET booking_id = 17857 WHERE id = 16989;
  Step 3: UPDATE booking SET confirmed = true WHERE id IN (17856, 17857);
  Step 4: UPDATE booking_course SET active = false WHERE id IN (24630, 24631);
  Step 5: Payment 17187 (EUR 6,151) -- find booking from ULEARNP2026124 in HubSpot; link once confirmed.
  Step 6: Payment 4781 (EUR 380, 2019) -- likely pre-SIS orphan; confirm with accounts.

Risk: payments / bookings. Reversible. Blast radius: 2-4 bookings.
Status: Fix NOT RUN. 223 consecutive checks. Last checked: Thu 13 Aug 2026 UTC
