Issue 7 - Sofiia Korkishchenko BK17909 Cancelled+Confirmed Anomaly (16th check, 29 Jul 2026)
Reporter: AC | Area: Booking | Sheet row: 8

Root cause (live check Wed 29 Jul 2026 UTC)
- Booking 17909 (student 768 Sofiia Korkishchenko): status=CANCELLED, confirmed=true (anomaly)
- Last updated 17 Jun 2026 -- 42 days stale
- Amount open=EUR 727.50, amount paid=EUR 0, no payments on this booking
- Booking course 24693 (Renewal Academic Year PM, 25 May-13 Nov 2026): active=true (should be deactivated)

Fix recipe (NOT YET RUN)
UPDATE Booking SET confirmed=false, updatedAt=NOW() WHERE id=17909;
UPDATE BookingCourse SET active=false, updatedAt=NOW() WHERE id=24693;

Risk: Bookings - low; booking already CANCELLED, cosmetic cleanup. Reversible.
Status: Unchanged - Fix NOT RUN.
Last checked: 2026-07-29 UTC