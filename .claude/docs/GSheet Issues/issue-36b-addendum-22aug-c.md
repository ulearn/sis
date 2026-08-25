# Issue 36 (b) Addendum 22 Aug 2026 (c) — Pietro Caccianiga

Reporter: AC | Area: Booking / Accomm | Sheet row: 38

Symptom: Accommodation dates wrong; student paid for 11 weeks (Jun 28 – Sep 13).

Root cause (447th check, Sat 22 Aug 2026 UTC — 3rd check today, unchanged since 444th):
- BA 11311 (bed 84, booking 17980): Jun 28–22 Aug, fee EUR 3,850, active — checkout done but not deactivated.
- BA 11393 (bed 88, booking 17980): 22 Aug–13 Sep 2026, fee = null, active — checkin done, fee NOT SET.
- Booking 17980: CONFIRMED, fully paid EUR 5,331, amountOpen = 0.
- Fee for BA 11393: EUR 5,331 − EUR 3,850 = EUR 1,481.

Fix recipe (NOT YET RUN):

Step 1 — Set fee on BA 11393 (bed 88, started today):
  UPDATE booking_accommodations SET fee = 1481, updated_at = NOW() WHERE id = 11393;

Step 2 — Deactivate BA 11311 (bed 84, ended today):
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11311;

Verify:
  SELECT id, bed_id, start_date, end_date, fee, active FROM booking_accommodations WHERE id IN (11311, 11393);
  Expect: 11311 active=false; 11393 fee=1481 active=true.

Risk: bookings/accomm | Reversible: yes | Blast radius: 1 booking, 2 BAs.
Status: CRITICAL — Aug 22 checkin/checkout day. Fix NOT RUN (3rd check today).
Last checked: 2026-08-22 Sat UTC (447th check)
