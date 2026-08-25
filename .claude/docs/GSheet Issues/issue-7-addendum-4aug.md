# Issue 7 — Sofiia Korkishchenko Cancelled Booking Anomaly (24th check Tue 4 Aug 2026 UTC)
Reporter: AC | Area: Booking | Sheet row: 8

## Root Cause (confirmed 2026-08-04 UTC — 50 days unchanged)
- Booking 17909 (Sofiia Korkishchenko, student 768): status=CANCELLED, confirmed=true — anomalous
- Booking course 24693 (Renewal Academic Year PM, 2026-05-25 to 2026-11-13): active=true on CANCELLED booking
- Amount open=EUR 727.50, amount paid=EUR 0

## Fix Recipe (NOT YET RUN)
1. Verify bk17909 is correctly cancelled (check HubSpot deal linked to student 768).
2. If confirmed cancelled:
   UPDATE bookings SET confirmed=false WHERE id=17909;
   UPDATE booking_courses SET active=false WHERE id=24693;
3. Verify: SELECT id,status,confirmed FROM bookings WHERE id=17909;
            SELECT id,active FROM booking_courses WHERE id=24693;

## Risk: bookings, data-hygiene | Reversible: yes | 1 student, low risk

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (24th check, 50 days)