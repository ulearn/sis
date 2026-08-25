Issue 41 addendum 24aug-b — Giampaolo Russo — new finding: Vincenzo Gagliano bed 89 prev-tenant stale
Reporter: KC | Area: Booking / Accomm | Sheet row 43 | 492nd check Mon 24 Aug 2026 UTC

Root Cause (verified from live DB, 24 Aug 2026)

Giampaolo Russo (student 14571, booking 18180):
- BA 11357 (bed 178, 2-15 Aug 2026, EUR 1,250): 9 days stale, active = true
- BA 11396 (bed 44, 15-22 Aug 2026, fee null): 2 days stale, active = true
- BA 11397 (bed 89, 22 Aug-6 Sep 2026, fee null): current stay day 3, fee missing
- BA 11392 (bed 168, 6-14 Sep 2026): future stay, OK

NEW FINDING - Vincenzo Gagliano (student 2962, booking 18175), previous occupant on bed 89:
- BA 11387 (bed 89, 9-22 Aug 2026, fee null): 2 days stale, active = true
  Both BA 11387 and BA 11397 are simultaneously active on bed 89.
- BA 11355 (bed 161, 25 Jul-9 Aug 2026, fee EUR 1,360): 15 days stale, active = true
  Different bed; no current conflict but untacked.

Fix Recipe (NOT YET RUN)

Step 1 - Deactivate Giampaolo stale BAs:
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id IN (11357, 11396);

Step 2 - Deactivate Vincenzo stale BAs (verify BA 11387 fee null = gratis or missing?):
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id IN (11387, 11355);

Step 3 - Set fee on BA 11397 (Giampaolo current stay; verify rate with Kelly; est EUR 1,250 for 2wks):
  UPDATE booking_accommodations SET fee = 1250.00, updated_at = NOW() WHERE id = 11397;

Risk / Category
Category: accommodations / data-hygiene. Reversible. 4 BAs across 2 students.

Status: Fix NOT RUN
Last checked: 2026-08-24 UTC (492nd check)