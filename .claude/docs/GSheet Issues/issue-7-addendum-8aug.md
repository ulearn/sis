Issue 7 - Sofiia Korkishchenko: Booking 17909 CANCELLED+confirmed Anomaly (36th check, Sat 8 Aug 2026 UTC)

Reporter: (booking) | Area: Booking | Sheet row: 8

SYMPTOM: Booking 17909 status=CANCELLED but confirmed=true. BC24693 still active on a cancelled booking.

ROOT CAUSE (live 2026-08-08 UTC):
  Booking 17909 (Sofiia Korkishchenko, student 768): CANCELLED, confirmed=true (anomaly)
  amountTotal=EUR 727.50, amountPaid=EUR 0 - 0 payment records; last updated 2026-06-17 (52 days ago)
  Booking Course 24693 (Renewal - Academic Year PM, 2026-05-25 to 2026-11-13): active=true on cancelled booking
  Student correct enrollment: Booking 17849 CONFIRMED + BC24623 (Academic Year Renewal Afternoon, Jun8-Nov27 2026)
  Payment 17468 (EUR 1,455.50 Bank May 22) linked to bk17849 - correct; bk17909 has 0 payments.

FIX RECIPE (NOT YET RUN):
  Step 1: UPDATE Booking SET confirmed = false WHERE id = 17909;
  Step 2: UPDATE BookingCourse SET active = false WHERE id = 24693;
  Step 3: (Optional) Zero open amount on bk17909 - Neil call.

RISK: Bookings + Data hygiene; no money risk. Reversible. Student active enrollment unaffected.
Status: OPEN - Fix NOT RUN
Last checked: 2026-08-08 UTC (36th hourly check)