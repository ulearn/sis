Issue 36 addendum - Pietro Caccianiga - Fri 21 Aug 2026 19:00 UTC
Symptom: Accommodation dates error, student paid 11 weeks Jun 28 to Sep 13.
Root cause confirmed: Booking 17980 CONFIRMED, fully paid EUR 5,331.
BA 11311 (bed 84): checkout TOMORROW Sat 22 Aug, fee EUR 3,850, active.
BA 11393 (bed 88): checkin TOMORROW Sat 22 Aug, fee = null, active.
Calculated fee: EUR 5,331 minus EUR 3,850 = EUR 1,481 for BA 11393.
CRITICAL: Sat 22 Aug < 17 hours away.
Fix NOT YET RUN:
  Step 1: UPDATE BookingAccommodation SET fee = 1481 WHERE id = 11393
  Step 2 (after checkout): UPDATE BookingAccommodation SET active = false WHERE id = 11311
Risk: Bookings/Money, reversible, single booking 17980.
Last checked: Fri 21 Aug 2026 ~19:00 UTC