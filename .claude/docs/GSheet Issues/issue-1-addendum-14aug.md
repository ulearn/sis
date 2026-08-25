# Issue 1 -- Orphan Payments (255th check Fri 14 Aug 2026)

Reporter: NM | Area: Cleanup | Sheet row: 2
255th check -- Fri 14 Aug 2026 UTC

## Symptom
4 payments with booking_id = null remain. Bookings 17856/17857 have confirmed = false.
Booking Courses 24630 + 24631 ended 2026-07-10 but active = true.

## Root Cause (evidence)
- Payment 4781: EUR 380, Flywire, 2019-08-20 -- orphan (legacy), booking_id = null
- Payment 16988: EUR 339.90, Bank, 2026-04-28 -- orphan; likely for Booking 17856 (Margherita Galbusera, student 14461)
- Payment 16989: EUR 339.90, Bank, 2026-04-28 -- orphan; likely for Booking 17857 (Francesca Fassina, student 14462)
- Payment 17187: EUR 6151, TransferMate Escrow, 2026-05-01, ref ULEARNP2026124 -- orphan; no matching 2026 booking by amount; needs manual investigation
- Booking 17856 (Margherita Galbusera, student 14461): CONFIRMED, confirmed=false, amount_paid=339.90, amount_total=339.90
- Booking 17857 (Francesca Fassina, student 14462): CONFIRMED, confirmed=false, amount_paid=339.90, amount_total=339.90
- Booking Course 24630 (booking 17857): ended 2026-07-10, active=true -- 35 days stale
- Booking Course 24631 (booking 17856): ended 2026-07-10, active=true -- 35 days stale
- No change since 254th check (Thu 13 Aug ~22:00 UTC)

## Fix Recipe (NOT YET RUN)

Step 1: Link Payment 16988 to Booking 17856 (Margherita Galbusera):
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;  -- NOT YET RUN

Step 2: Link Payment 16989 to Booking 17857 (Francesca Fassina):
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;  -- NOT YET RUN

Step 3: Mark both bookings confirmed:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);  -- NOT YET RUN

Step 4: Deactivate stale booking courses:
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);  -- NOT YET RUN

Step 5: Payments 4781 and 17187 need manual investigation before linking.
  - 4781 comment: ULS771773625 / 21022 (Fidelo ref 21022)
  - 17187 ref: ULEARNP2026124 -- check Hub fins/TransferMate records

## Risk / Category
money / data-hygiene | Reversible: yes | Blast radius: 2 students, 2 bookings, 4 payments

## Status
OPEN. No change for 255 checks. Fix NOT RUN.

Last checked: Fri 14 Aug 2026 UTC
Previous recipe: issue-1-addendum-13aug-f.md