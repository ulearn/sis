Issue 20 Addendum 31jul (Ariunsarnai Batbayar, Day 109, Fri 31 Jul 2026 UTC)

Reporter: PG | Area: Booking/Class | Sheet row: 21

Root Cause (fresh DB check)
- Booking 1605 (Ariunsarnai Batbayar, student 1047): status = PENDING, confirmed = false.
- Amount paid = EUR 0. Zero payment records in DB for booking_id = 1605.
- Booking Course 1791 (Academic Year Renewal Morning, 2026-04-13 to 2026-10-23): active = true.
- Day 109 from course start (Apr 13 to Jul 31). No change from prior check.

Fix Recipe (NOT YET RUN)

Option A — Payment has arrived or is expected:
  1. Locate payment in HubSpot deal linked to booking 1605 / student 1047.
  2. If payment confirmed, insert payment record and set booking.confirmed = true:
     UPDATE bookings SET confirmed = true, updated_at = NOW() WHERE id = 1605;

Option B — No payment coming; student no longer attending:
  UPDATE bookings SET status = 'CANCELLED', confirmed = false, updated_at = NOW() WHERE id = 1605;
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 1791;
  Verify: SELECT id, status, confirmed FROM bookings WHERE id = 1605;

Risk: Bookings/Money — reversible (status can be reset). Blast radius: 1 booking + 1 booking course.
Status: NOT RUN. Day 109 from Apr 13; EUR 0 received. Escalating.
Last checked: 2026-07-31 UTC.
