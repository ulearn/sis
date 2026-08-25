Issue 20 - Ariunsarnai Batbayar: No Payment on Active Booking

Reporter: PG | Area: Booking/Class | Sheet row: 21 | Check: 8th (7th Sat 1 Aug 2026 UTC)

Root Cause (fresh DB - NOT YET FIXED):
Booking 1605 (Ariunsarnai Batbayar, student 1047): status=PENDING, confirmed=false.
Amount paid = EUR 0 of EUR 1,509 total - no payments on record.
Booking course 1791 (Academic Year Renewal Morning, Apr 13 to Oct 23 2026): fee=EUR 2,150, 0 class assignments, active=true.
Booking last updated 2026-06-23 - 39 days stale.
Day 110 since course start date (Apr 13 2026).

Fix Recipe (NOT YET RUN):
Step 1 - Chase payment: contact student/agent regarding outstanding EUR 1,509 on booking 1605.
Step 2 - If payment confirmed, link it (NOT YET RUN): INSERT INTO payments (booking_id, amount, method, payment_date, created_at) VALUES (1605, 1509, '<method>', '<date>', NOW());
Step 3 - Confirm booking (NOT YET RUN): UPDATE bookings SET confirmed=true, status='CONFIRMED' WHERE id=1605;
Step 4 - If no payment expected, cancel (NOT YET RUN): UPDATE bookings SET status='CANCELLED' WHERE id=1605;
Step 5 - Once confirmed, create class assignment via SIS admin for BC 1791.

Risk: bookings/payments, reversible, 1 student.

Status: Open - 8th check (7th today). NOT FIXED. Day 110, EUR 0 / 1,509. No action since Jun 23.
Last checked: 2026-08-01 UTC
