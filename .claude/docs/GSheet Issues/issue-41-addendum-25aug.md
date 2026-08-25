Issue 41 -- Giampaolo Russo Dual Accommodation

Reporter: Various | Area: Booking/Accomm | Sheet row: 43
Last checked: 2026-08-25 UTC (514th run)

ROOT CAUSE (current)
Student 14571. Booking Accommodations:
- BA11357 (bed 178): ended 2026-08-15 -- 10 days stale, active=true, fee 1250
- BA11396 (bed 44): ended 2026-08-22 -- 3 days stale, active=true, fee null
- BA11397 (bed 89): CURRENT stay, ends 2026-09-06, active=true, fee null (NEEDS FEE SET -- 12 days)
- BA11392 (bed 161): future 2026-09-06 to 2026-09-14, active=true, fee=415 -- correct

UPDATE (514th check): Bed 89 stale BAs -- both now CLEANED:
- BA11387 (Vincenzo Gagliano, bed 89, ended 2026-08-22): cleanedAt = 2026-08-24 16:11 -- CLEANED, fee null, still active
- BA11394 (Fabrizio Mauro, bed 89, ended 2026-08-09): cleanedAt = 2026-08-12 17:13 -- CLEANED, fee null, still active
Both are safe to deactivate now (no uncleaned block).

FIX RECIPE (NOT YET RUN)
1. Deactivate stale BAs (all cleaned, safe):
   UPDATE booking_accommodation SET active = false WHERE id IN (11357, 11396, 11387, 11394);
2. Set fee on current stay BA11397 (Giampaolo, bed 89, Aug 22 to Sep 6):
   UPDATE booking_accommodation SET fee = <rate> WHERE id = 11397;
   (confirm weekly rate with KC; deadline Sep 6 = 12 days)
3. BA11392 fee=415 already correct. No action needed.

PROGRESS: BA11392 fee fixed (issued 24 Aug). BA11387 cleaned 24 Aug. BA11394 cleaned 12 Aug. Deactivations NOT RUN.

RISK: Data-hygiene -- stale BAs blocking bed; fee null on current stay. Reversible.

STATUS: Partial (BA11392 fee fixed, BAs cleaned). Deactivation and BA11397 fee NOT RUN.
