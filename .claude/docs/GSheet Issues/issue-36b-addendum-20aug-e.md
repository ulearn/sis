Issue 36b status — Pietro Caccianiga 250th check Thu 20 Aug 2026 (late night)
No change since 249th check (night). DB verified.

Booking Accommodation 11393 bed 88: starts Sat 22 Aug, ends 13 Sep 2026, active, fee = null
CRITICAL: fee must be set before Sat 22 Aug (in 2 days)

Booking Accommodation 11311 bed 84: ends Sat 22 Aug, active, fee = EUR 3,850
Deactivate after checkout Sat 22 Aug

Fee calculation: EUR 5,331 total - EUR 3,850 (BA 11311) = EUR 1,481 for BA 11393

Fix NOT RUN

Step 1 TODAY (must do before Sat 22):
UPDATE booking_accommodations SET fee = 1481 WHERE id = 11393;

Step 2 after Sat 22 Aug checkout:
UPDATE booking_accommodations SET active = false WHERE id = 11311;

Deadline: Sat 22 Aug 2026