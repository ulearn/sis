# Issue 41 - Giampaolo Russo (student 14571)
Reporter: KC | Area: Booking / Accomm | Sheet row 43 | 469th check Mon 24 Aug 2026 UTC

## Root Cause (verified from live DB, 24 Aug 2026)
BA 11357 (bed 178, 2-15 Aug 2026, EUR 1250): 10 days stale, active = true
BA 11396 (bed 44, 15-22 Aug 2026, fee null): 2 days stale, active = true
BA 11397 (bed 89, 22 Aug - 6 Sep 2026, fee null): current stay day 3, fee missing
BA 11392 (bed 168, 6-14 Sep 2026, EUR 415): future - OK

## Fix Recipe (NOT YET RUN)
Step 1 - Deactivate stale BAs:
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id IN (11357, 11396);

Step 2 - Set fee on BA 11397 (verify rate with Kelly; est EUR 1,250 for 2wks at EUR 625/wk):
  UPDATE booking_accommodations SET fee = 1250.00, updated_at = NOW() WHERE id = 11397;

## Risk
Category: Accommodations / data-hygiene / money. Reversible. Single student.

## Status
Fix NOT RUN. Last checked: 2026-08-24 UTC (469th check).