# Issue 7 — Sofiia Korkishchenko: Booking 17909 CANCELLED+confirmed (39th check, Tue 11 Aug 2026 UTC)
Reporter: (booking) | Area: Booking | Sheet row: 8

## Status
Unchanged from 38th check (Mon 10 Aug 2026). 64 days open. Last change to booking was 2026-06-17 (55 days ago).

## Root Cause
- Booking 17909 (Sofiia Korkishchenko, student 768): status = CANCELLED, confirmed = true (anomaly)
- Amount paid = EUR 0, amount open = EUR 727.50, no payment records
- Booking Course 24693 (Renewal - Academic Year PM, 25 May to 13 Nov 2026): active = true on cancelled booking
- Student correctly enrolled on booking 17849 / BC 24623 — no student impact

## Fix Recipe (NOT YET RUN)
Step 1 — Set booking 17909 confirmed = false:
  UPDATE Booking SET confirmed = false WHERE id = 17909;

Step 2 — Deactivate Booking Course 24693:
  UPDATE BookingCourse SET active = false WHERE id = 24693;

## Risk / Category
Bookings + Data hygiene. Reversible. Student active enrollment unaffected.

## Last checked: 2026-08-11 UTC