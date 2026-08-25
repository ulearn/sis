# Issue 36b: Pietro Caccianiga (14521) — Accomm Dates
Reporter: Diego | Area: Booking / Accomm | Sheet row 38 | 466th run 2026-08-22 UTC

## Root cause
- BA 11311 (bed 84): ended 22 Aug 2026 (today), fee EUR 3850, active=true -- stale as of today
- BA 11393 (bed 88): started 22 Aug, ends 13 Sep 2026, fee=null, active=true -- fee missing
- Booking 17980 CONFIRMED, linked to both BAs

## Fix recipe (NOT YET RUN)
Step 1 -- Deactivate BA 11311 (ended today):
  SELECT id,bed_id,start_date,end_date,fee,active FROM booking_accommodations WHERE id=11311;
  UPDATE booking_accommodations SET active=false, updated_at=NOW() WHERE id=11311;

Step 2 -- Set fee on BA 11393 (confirm EUR amount from invoice):
  SELECT id,bed_id,start_date,end_date,fee,active FROM booking_accommodations WHERE id=11393;
  -- UPDATE booking_accommodations SET fee=XXXX, updated_at=NOW() WHERE id=11393;

## Risk
bookings -- reversible. Blast radius: Pietro only.
Step 1 safe (past end date). Step 2 needs correct amount confirmed first.

## Status
URGENT: BA 11311 ended today, still active.

## Last checked
466th run -- 2026-08-22 UTC