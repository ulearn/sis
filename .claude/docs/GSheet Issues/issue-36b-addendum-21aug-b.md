# Issue 36 (b) Addendum 21 Aug 2026 (Very Late Evening) — Pietro Caccianiga

Reporter: AC | Area: Booking / Accomm | Sheet row: 38

Symptom: Accommodation dates wrong; student paid for 11 weeks (Jun 28 - Sep 13).

Root cause (258th check, Fri 21 Aug 2026 very late evening — no change since 257th):
- BA 11311 (bed 84, booking 17980): Jun 28 to Sat 22 Aug, fee EUR 3,850, active. Checkout overnight/Sat morning.
- BA 11393 (bed 88, booking 17980): Sat 22 Aug to 13 Sep, fee = null, active. CRITICAL: checkin Sat 22, fee still not set.
- Booking 17980: CONFIRMED, fully paid EUR 5,331, open EUR 0.

Fee for BA 11393: EUR 5,331 total minus EUR 3,850 (BA 11311) = EUR 1,481.

Fix recipe (NOT YET RUN — checkin is Sat 22 Aug, <12 hours, URGENT):

Step 1 — Set fee on BA 11393 BEFORE Sat 22 checkin:
  UPDATE booking_accommodations SET fee = 1481, updated_at = NOW() WHERE id = 11393;

Step 2 — Deactivate BA 11311 AFTER checkout Sat 22:
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11311;

Verify:
  SELECT id, bed_id, booking_id, start_date, end_date, fee, active FROM booking_accommodations WHERE id IN (11311, 11393);
  Expect: 11311 active=false, 11393 fee=1481 active=true

Risk: bookings/accomm | Reversible: yes | Blast radius: 1 booking, 2 BAs
Status: CRITICAL — checkin Sat 22 Aug <12h. Fix NOT RUN.
Last checked: 2026-08-21 Fri very late evening (258th check)