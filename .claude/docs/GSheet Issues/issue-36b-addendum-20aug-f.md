# Issue 36 (b) Addendum 20 Aug 2026 Night — Pietro Caccianiga

Reporter: AC | Area: Booking / Accomm | Sheet row: 38

Symptom: Accommodation dates wrong; student paid for 11 weeks (Jun 28 - Sep 13); system won't allow date changes.

Root cause (252nd check, 20 Aug 2026 night — no change since 251st):
- BA 11311 (bed 84, bk 17980): Jun 28 to Aug 22, fee EUR 3,850, active. Deactivate after checkout Sat 22.
- BA 11393 (bed 88, bk 17980): Aug 22 to Sep 13, fee = null, active. CRITICAL: student moves in Sat 22, fee not set.
- Booking 17980: CONFIRMED, fully paid EUR 5,331, amount open EUR 0.

Fix recipe (NOT YET RUN):

Step 1 - Set fee on BA 11393 (do before Sat 22):
  Basis: EUR 5,331 paid minus EUR 3,850 (BA 11311) = EUR 1,481.
  UPDATE booking_accommodations SET fee = 1481 WHERE id = 11393;

Step 2 - Deactivate BA 11311 after checkout Sat 22:
  UPDATE booking_accommodations SET active = false WHERE id = 11311;

Risk: bookings/accomm | Reversible: yes | Blast radius: 1 booking, 2 BAs
Status: No change. Sat 22 = 2 days. Last checked: 2026-08-20 night