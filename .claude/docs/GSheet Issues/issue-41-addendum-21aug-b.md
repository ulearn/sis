# Issue 41 Addendum 21 Aug 2026 (Very Late Evening) — Giampaolo Russo

Reporter: AC | Area: Booking / Accomm | Sheet row: 43

Symptom: Student booked host family and apartment; accommodation data inconsistent.

Root cause (155th check, Fri 21 Aug 2026 very late evening — no change since 154th):

Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, fully paid EUR 2,584.96.

Booking Accommodations for booking 18180:
- BA 11357 (bed 178, host family): Aug 2-15, fee EUR 1,250, active — 6 days stale, deactivate.
- BA 11396 (bed 44, host family): Aug 15-22, fee = null, active — checkout Sat 22; CRITICAL: fee still not set.
- BA 11397 (bed 89, apartment): Aug 22 - Sep 6, fee = null, active — checkin Sat 22; CRITICAL: fee still not set.

Fee calculation: EUR 2,584.96 - EUR 1,250 (BA 11357) = EUR 1,334.96 remaining.
If BA 11392 (bed 168, Sep 6-14, fee EUR 415) is in scope: EUR 1,334.96 - EUR 415 = EUR 919.96 for BAs 11396+11397.
Proportional split (1 week + 2 weeks): BA 11396 = EUR 306.65, BA 11397 = EUR 613.31.

Separate booking (BA 11394, booking 17826):
- BA 11394 (bed 89, booking 17826): Jun 14 - Aug 9, fee = null, active — 12 days stale.
- Booking 17826: PARTIAL, paid EUR 4,283, total EUR 4,283.80 (EUR 0.80 open). Confirm fee before deactivating.

Fix recipe (NOT YET RUN — checkout/checkin Sat 22 Aug, <12 hours, URGENT):

Step 1 — Set fee on BA 11396 BEFORE Sat 22 checkout (tonight):
  UPDATE booking_accommodations SET fee = 306.65, updated_at = NOW() WHERE id = 11396;

Step 2 — Deactivate BA 11396 AFTER checkout Sat 22:
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11396;

Step 3 — Set fee on BA 11397 BEFORE checkin Sat 22:
  UPDATE booking_accommodations SET fee = 613.31, updated_at = NOW() WHERE id = 11397;

Step 4 — Deactivate stale BA 11357:
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11357;

Step 5 — Verify fee then deactivate BA 11394 (booking 17826):
  UPDATE booking_accommodations SET fee = <check_amount>, active = false, updated_at = NOW() WHERE id = 11394;

Verify:
  SELECT id, bed_id, booking_id, start_date, end_date, fee, active FROM booking_accommodations WHERE id IN (11357, 11394, 11396, 11397);
  Expect: 11357 active=false; 11396 fee=306.65 active=false; 11397 fee=613.31 active=true; 11394 fee set active=false.

Risk: bookings/accomm | Reversible: yes | Blast radius: 2 bookings, 4 BAs
Status: CRITICAL — checkout/checkin Sat 22 Aug <12h. Fix NOT RUN.
Last checked: 2026-08-21 Fri very late evening (155th check)