# Issue 27 — Sofiia Korkishchenko: Booking 17909 CANCELLED but confirmed = true (47 days)

Reporter: (various)  Area: Booking / Class  Sheet row: 28

## Root cause (confirmed 2026-08-03 UTC)
- Booking 17909 (Sofiia Korkishchenko, student 768): status = CANCELLED, confirmed = true (anomaly).
- Last updated: 2026-06-17 — 47 days with no change.
- Amount paid = EUR 0, amount open = EUR 727.50.
- Booking course 24693 (Renewal Academic Year PM, 2026-05-25 to 2026-11-13): active = true on a cancelled booking.
- No change from 37th check (Sat 1 Aug).

## Fix recipe (NOT YET RUN)

Step 1 — Set confirmed = false on booking 17909 (NOT YET RUN):
  UPDATE booking SET confirmed = false WHERE id = 17909;

Step 2 — Deactivate booking course 24693 (NOT YET RUN):
  UPDATE booking_course SET active = false WHERE id = 24693;

Step 3 — Verify student 768 has a valid current booking (NOT YET RUN):
  SELECT b.id, b.status, b.confirmed, bc.id bc_id, bc.active FROM booking b
  JOIN booking_course bc ON bc.booking_id = b.id WHERE b.student_id = 768 ORDER BY b.id;

## Risk
Category: data-hygiene / bookings. Reversible: yes. Blast radius: 1 student, 1 booking, 1 booking course.

## Status: OPEN — 47 days, booking 17909 CANCELLED + confirmed = true
Last checked: 2026-08-03 UTC (38th hourly check)
