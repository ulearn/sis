# Issue 41 Addendum 20 Aug 2026 Night — Giampaolo Russo

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Symptom: Student booked host family (Aug 2 - Sep 6) and apartment at Capel (Sep 6 - Sep 14); neither in SIS or Matching.

Root cause (149th check, 20 Aug 2026 night — no change since 148th):
- BA 11394 (bed 89, bk 17826): ended Aug 9, 11 days stale, fee null. Deactivate TODAY.
- BA 11357 (bed 178, bk 18180): ended Aug 15, 5 days stale, fee EUR 1,250. Deactivate ASAP.
- BA 11396 (bed 44, bk 18180): Aug 15-22 (CURRENT stay), fee null. CRITICAL: student in residence, checkout Sat 22.
- BA 11397 (bed 89, bk 18180): Aug 22 - Sep 6, fee null. CRITICAL: starts Sat 22.
- BA 11392 (bed 168, bk 18180): Sep 6-14, fee EUR 415. Future - no action yet.
- Booking 18180: CONFIRMED, fully paid EUR 2,584.96, open EUR 0.
- Accounted: EUR 1,665 (BAs 11357 + 11392). Remaining for 11396+11397: EUR 919.96.

Fix recipe (NOT YET RUN):

Step 1 - Set fees on BAs 11396+11397 (confirm split with Diego/KC):
  Proportional estimate: BA 11396 (1 wk) = EUR 184.99, BA 11397 (2 wks) = EUR 734.97.
  UPDATE booking_accommodations SET fee = 184.99 WHERE id = 11396;
  UPDATE booking_accommodations SET fee = 734.97 WHERE id = 11397;

Step 2 - Deactivate stale BAs 11394, 11357:
  UPDATE booking_accommodations SET active = false WHERE id IN (11394, 11357);

Step 3 - Deactivate BA 11396 after checkout Sat 22:
  UPDATE booking_accommodations SET active = false WHERE id = 11396;

Risk: bookings/accomm/accounts | Reversible: yes | Blast radius: 1 student, 4 BAs
Status: No change. Sat 22 = 2 days. Last checked: 2026-08-20 night