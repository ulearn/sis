Issue 1 -- Orphan Payments (Thu 13 Aug 2026)

Reporter: NM | Area: Cleanup | Sheet row: 2
224th check -- Thu 13 Aug 2026 ~16:04 UTC

Symptom:
4 payments with booking_id = null remain in DB. Bookings 17856/17857 have confirmed=false.
Booking Courses 24630+24631 ended Jul 10 but active=true.

Root Cause (evidence):
- Payment 4781: EUR 380, Flywire, comment ULS771773625/21022, date 2019-08-20 -- orphan (legacy)
- Payment 16988: EUR 339.90, HUBSPOT, date 2026-04-28 -- orphan; likely for Booking 17856 (Margherita Galbusera)
- Payment 16989: EUR 339.90, HUBSPOT, date 2026-04-28 -- orphan; likely for Booking 17857 (Francesca Fassina)
- Payment 17187: EUR 6,151, FIDELO, comment ULEARNP2026124, date 2026-05-01 -- orphan (Escrow)
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amountPaid=EUR 339.90
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false, amountPaid=EUR 339.90
- BC 24630: ended 2026-07-10, active=true (34 days stale)
- BC 24631: ended 2026-07-10, active=true (34 days stale)
- No change since 223rd check

Fix Recipe (NOT YET RUN):

Step 1: Link Payment 16988 to Booking 17856:
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;  -- NOT YET RUN

Step 2: Link Payment 16989 to Booking 17857:
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;  -- NOT YET RUN

Step 3: Mark bookings as confirmed:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);  -- NOT YET RUN

Step 4: Deactivate stale booking courses:
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);  -- NOT YET RUN

Step 5: Payment 4781 (legacy 2019 Flywire) and Payment 17187 (Escrow) -- investigate manually
  before linking; they may require HubSpot/Xero lookup to confirm correct booking.

Risk: money/data-hygiene | Reversible: yes | Blast radius: 2 students, 2 bookings, 4 payments

Status: OPEN. No change for 224 checks. Fix NOT RUN.
Last checked: Thu 13 Aug 2026 ~16:04 UTC
Previous recipe: issue-1-addendum-13aug-c.md