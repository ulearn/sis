# Issue 43 -- Jesus Ramirez Diaz: 5 Stale Booking Accommodations on Bed 83
Check: 19th, Sun 9 Aug 2026 UTC | Reporter: (staff) | Row: 45

ROOT CAUSE
5 stale booking accommodations on bed 83 -- all ended but still active = true:
  BA 11239 (booking 22):    ended 2026-05-24 -- 77 days stale
  BA 11168 (booking 92):    ended 2026-06-20 -- 50 days stale
  BA 11285 (booking 17825): ended 2026-07-05 -- 35 days stale (fee = null)
  BA 11352 (booking 18156): ended 2026-07-11 -- 29 days stale
  BA 11179 (booking 82):    ended 2026-08-09 -- TODAY (newly stale)

Current and future (keep active):
  BA 11173 (booking 88):    2026-08-09 to 2026-08-30 -- CURRENT
  BA 25    (booking 17844): 2026-08-30 to 2026-10-11 -- FUTURE

FIX RECIPE -- NOT YET RUN

UPDATE booking_accommodations
SET active = false, updated_at = NOW()
WHERE id IN (11239, 11168, 11285, 11352, 11179);

Also note: BA 11285 has fee = null -- check booking 17825 for correct fee and set separately.

Verify:
  SELECT id, end_date, active FROM booking_accommodations WHERE id IN (11239, 11168, 11285, 11352, 11179);
  Expect: all active = false

  SELECT id, start_date, end_date, active FROM booking_accommodations WHERE bed_id = 83 AND active = true ORDER BY start_date;
  Expect: only BA 11173 (Aug 9-30) and BA 25 (Aug 30-Oct 11)

RISK: Category=Data hygiene/Accommodation (cosmetic) | Reversible=Yes
Blast radius: Bed 83 display only; no financial impact

STATUS: Open -- Fix NOT RUN
Last checked: Sun 9 Aug 2026 UTC (19th check) | BA 11179 ended today (5th stale) | BA 11173 is current
