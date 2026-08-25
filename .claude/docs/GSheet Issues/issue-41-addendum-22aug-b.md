# Issue 41 Addendum 22 Aug 2026 (b) — Giampaolo Russo

Reporter: AC | Area: Booking / Accomm | Sheet row: 43

Symptom: Student booked host family then apartment; accommodation data inconsistent.

Root cause (446th check, Sat 22 Aug 2026 UTC — still unfixed since 444th):

Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, fully paid EUR 2,584.96.

Booking Accommodations for booking 18180:
- BA 11357 (bed 178, host family): Aug 2–15, fee EUR 1,250, active — 7 days stale, deactivate.
- BA 11396 (bed 44, host family): Aug 15–22, fee = null, active — checkout done today, fee NOT SET.
- BA 11397 (bed 89, apartment): Aug 22–Sep 6, fee = null, active — checkin done today, fee NOT SET.

Fee calculation (confirm with Diego before running):
  EUR 2,584.96 total − EUR 1,250 (BA 11357) = EUR 1,334.96 remaining.
  If BA 11392 (bed 168, Sep 6–14, EUR 415) is in scope: EUR 1,334.96 − EUR 415 = EUR 919.96 for 11396+11397.
  Proportional split (1 week + 2 weeks): BA 11396 = EUR 306.65, BA 11397 = EUR 613.31.

Fix recipe (NOT YET RUN):

Step 1 — Set fee on BA 11396 (host family checkout, bed 44, today):
  UPDATE booking_accommodations SET fee = 306.65, updated_at = NOW() WHERE id = 11396;

Step 2 — Deactivate BA 11396 after checkout:
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11396;

Step 3 — Set fee on BA 11397 (apartment checkin, bed 89, today):
  UPDATE booking_accommodations SET fee = 613.31, updated_at = NOW() WHERE id = 11397;

Step 4 — Deactivate stale BA 11357 (bed 178, ended Aug 15):
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11357;

Verify:
  SELECT id, bed_id, booking_id, start_date, end_date, fee, active
  FROM booking_accommodations WHERE id IN (11357, 11396, 11397);
  Expect: 11357 active=false; 11396 fee=306.65 active=false; 11397 fee=613.31 active=true.

Risk: bookings/accomm | Reversible: yes | Blast radius: 1 booking, 3 BAs.
Status: CRITICAL — today is Aug 22 (checkin/checkout day). Fix NOT RUN (2nd check today).
Last checked: 2026-08-22 Sat UTC (446th check)
