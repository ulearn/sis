Issue 6 addendum - Erroneous Mobile Numbers - Fri 21 Aug 2026 19:00 UTC
Day 49. Fix not applied.

Current counts:
  Total students: 14,478 (up 3 since yesterday)
  No + prefix: 553 (unchanged)
  With + but spaces: 419
  With + but dashes: 14 (counted separately for first time)
  Total non-E.164 approx: 986 (up from 974)

Previously reported 421 with spaces or dashes combined.
Now counted separately: 419 spaces + 14 dashes. Some phones have both.
Unique non-E.164 after +: approx 428-433. Total including no-plus: approx 984-986.

Fix NOT YET RUN:
  BACK UP FIRST - not reversible without snapshot
  SELECT id, phoneMobile FROM Student WHERE phoneMobile LIKE "+%" AND phoneMobile ~ E'[\s\-]' LIMIT 20
  UPDATE Student SET phoneMobile = REPLACE(phoneMobile, ' ', '') WHERE phoneMobile LIKE '+%' AND phoneMobile ~ E'\s'
  UPDATE Student SET phoneMobile = REPLACE(phoneMobile, '-', '') WHERE phoneMobile LIKE '+%' AND phoneMobile ~ '-'

Warning: review dash samples before running - some formats may be valid.
Risk: Data hygiene, NOT directly reversible, approx 986 students.
Last checked: Fri 21 Aug 2026 ~19:00 UTC