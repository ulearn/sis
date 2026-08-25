# Issue 36b - Pietro Caccianiga (student 14521)
Reporter: KC | Area: Booking / Accomm | Sheet row 38 | 490th check Mon 24 Aug 2026 UTC

## Root Cause (verified from live DB, 24 Aug 2026)
BA 11311 (bed 84, 28 Jun - 22 Aug 2026, EUR 3850): ended 22 Aug, 2 days stale, active = true
BA 11393 (bed 88, 22 Aug - 13 Sep 2026, fee null): current stay day 3, fee missing
BC 24772 (General English AM): ends 11 Sep 2026, 18 days remaining

## Fix Recipe (NOT YET RUN)
Step 1 - Deactivate BA 11311:
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11311;

Step 2 - Set fee on BA 11393 (verify with Kelly; est EUR 1,050 for 3wks at ~EUR 350/wk based on EUR 3,850/11wk booking):
  UPDATE booking_accommodations SET fee = 1050.00, updated_at = NOW() WHERE id = 11393;

## Risk
Category: Accommodations / data-hygiene / money. Reversible. Single student.

## Status
Fix NOT RUN. Last checked: 2026-08-24 UTC (490th hourly run).