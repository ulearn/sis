# Issue 41: Giampaolo Russo (14571) — Stale Booking Accommodations
Reporter: Diego | Area: Booking / Accomm | Sheet row 43 | 466th run 2026-08-22 UTC

## Root cause
- BA 11357 (bed 178): ended 15 Aug 2026 -- 7 days stale, fee EUR 1250, active=true
- BA 11396 (bed 44): ended 22 Aug 2026 (today) -- stale as of today, fee=null, active=true
- BA 11397 (bed 89): started 22 Aug, ends 6 Sep 2026 -- current accommodation, fee=null, active=true
- All three on booking 18180

## Fix recipe (NOT YET RUN)
Step 1 -- Deactivate BA 11357 (7 days stale):
  SELECT id,bed_id,start_date,end_date,fee,active FROM booking_accommodations WHERE id=11357;
  UPDATE booking_accommodations SET active=false, updated_at=NOW() WHERE id=11357;

Step 2 -- Deactivate BA 11396 (ended today):
  SELECT id,bed_id,start_date,end_date,fee,active FROM booking_accommodations WHERE id=11396;
  UPDATE booking_accommodations SET active=false, updated_at=NOW() WHERE id=11396;

Step 3 -- Set fee on BA 11397 (current stay, fee null, confirm from invoice):
  SELECT id,bed_id,start_date,end_date,fee,active FROM booking_accommodations WHERE id=11397;
  -- UPDATE booking_accommodations SET fee=XXXX, updated_at=NOW() WHERE id=11397;

## Risk
bookings -- reversible. Blast radius: Giampaolo only.
Steps 1+2 safe (past end dates). Step 3 needs correct amount confirmed.

## Status
URGENT: BA 11396 ended today still active. BA 11357 7 days stale.

## Last checked
466th run -- 2026-08-22 UTC