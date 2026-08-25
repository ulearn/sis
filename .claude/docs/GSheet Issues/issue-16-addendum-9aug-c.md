# Issue 16 -- Melie Villard: 4 Stale Booking Accommodations on Bed 66
Check: 19th, Sun 9 Aug 2026 UTC | Reporter: ST | Row: 17

ROOT CAUSE
4 stale booking accommodations on bed 66 -- all ended but still active = true:
  BA 11216 (booking 46):    ended 2026-05-09 -- 92 days stale
  BA 11158 (booking 100):   ended 2026-05-17 -- 84 days stale
  BA 11282 (booking 17897): ended 2026-06-05 -- 65 days stale
  BA 11361 (booking 18190): ended 2026-08-09 -- TODAY (newly stale)
Bed 66 is free from Mon 10 Aug 2026 and available for reassignment.

FIX RECIPE -- NOT YET RUN

UPDATE booking_accommodations
SET active = false, updated_at = NOW()
WHERE id IN (11216, 11158, 11282, 11361);

Verify:
  SELECT id, end_date, active FROM booking_accommodations WHERE id IN (11216, 11158, 11282, 11361);
  Expect: all active = false

  SELECT id, active FROM booking_accommodations WHERE bed_id = 66 AND active = true;
  Expect: 0 rows

RISK: Category=Data hygiene/Accommodation (cosmetic) | Reversible=Yes
Blast radius: Bed 66 display only; no financial impact

STATUS: Open -- Fix NOT RUN
Last checked: Sun 9 Aug 2026 UTC (19th check) | BA 11361 ended today (newly stale)
