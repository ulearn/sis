Issue 20 Addendum - Fri 31 Jul 2026 (2nd check today)
Reporter: PG | Area: Booking/Class | Sheet row: 21
Student: Ariunsarnai Batbayar, student 1047, booking 1605

STATUS: UNCHANGED - EUR 0 PAID OF EUR 1,509 - DAY 109 FROM COURSE START

Evidence (live DB, Fri 31 Jul 2026 UTC)

Booking 1605: PENDING, confirmed = false | EUR 0 / 1,509 | last updated 23 Jun 2026 (38 days ago)
Payments: 0 records in DB for booking 1605
BC 1791: start 13 Apr 2026, day 109 today, active = true

Fix Recipe (NOT YET RUN)

Step 1 - Chase payment via HubSpot:
  Find deal for student 1047 / booking 1605.
  Check for any HubSpot payment not yet synced to SIS.
  If payment exists: sync to SIS; UPDATE bookings SET confirmed = true WHERE id = 1605;

Step 2 - If no payment and student not attending:
  UPDATE bookings SET status = 'CANCELLED' WHERE id = 1605;
  UPDATE booking_courses SET active = false WHERE booking_id = 1605;

Step 3 - Verify:
  SELECT status, confirmed FROM bookings WHERE id = 1605;
  SELECT active FROM booking_courses WHERE booking_id = 1605;

Risk: bookings, money | Reversible: Yes | Blast radius: 1 booking, 1 booking course

Status: Fix NOT RUN. Fri 31 Jul 2026 UTC, 2nd check today.
Day 109. EUR 0 paid; EUR 1,509 open. No activity since 23 Jun 2026.
