# Issue 41 — Giampaolo Russo Capel BA (8th check Thu 30 Jul 2026 UTC)

Reporter: KC | Area: Booking/Accomm | Sheet row: 43

## Root Cause
- Booking 18180 (student 14571, Giampaolo Russo): CONFIRMED, fully paid EUR 2,584.96.
- Booking Accommodation 11357: Host Family, bed 178 (Edel McDonald),
  2026-08-02 to 2026-09-06, active=true, fee=EUR 1,250. Present and correct.
- Capel Street BA (Sep 6 to Sep 14): STILL ABSENT.
  0 rows in booking_accommodations for bk18180 beyond BA 11357.
- BC 24956 (General English AM, starts Aug 3) is in Issue 38 BH list.
  Will shift to Aug 4 when that fix runs.
- CHECK-IN: SUNDAY 2 AUG 2026 — 3 DAYS AWAY.
- Blocked on Diego confirmation of Capel bed ID and fee.

## Fix Recipe (NOT YET RUN — awaiting Diego)

Step 1 — Diego to confirm:
  - Capel Street bed ID for Sep 6–Sep 14
  - Fee (1 week + 1 extra night = 8 nights)
  - Checkout date (Sep 14 or Sep 15?)

Step 2 — Insert Capel Street booking_accommodation:
  INSERT INTO booking_accommodations
    (booking_id,accommodation_type,room_type,start_date,end_date,weeks,active,fee,bed_id,created_at,updated_at)
  VALUES
    (18180,'Apartment','Individual','2026-09-06','<CHECKOUT_DATE>',1,true,<FEE>,<BED_ID>,NOW(),NOW());
  -- Verify: SELECT * FROM booking_accommodations WHERE booking_id=18180;

Step 3 — Recheck SIS matching section for student 14571 after insert.

## Risk / Category
Bookings/Accommodation — reversible (DELETE inserted row). Blast radius: 1 student.

## Status
NOT RUN. 8th check Thu 30 Jul 2026 UTC. CHECK-IN 3 DAYS (Sun Aug 2).
Awaiting Diego confirmation of Capel bed ID and fee.