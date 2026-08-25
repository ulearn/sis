Issue 43 -- Jesus Ramirez Diaz (bed 83 stale BAs) (addendum 20 Aug 2026)
Reporter: KC | Area: Booking/Accomm | Sheet row: 45 | Run: 51st (duplicate of Issue 37)

ROOT CAUSE (51st check, Thu 20 Aug 2026 UTC -- no change from 50th):
Same as Issue 37 (row 39) -- 5 stale BAs on bed 83, all unchanged:
  BA 11239 (ended 2026-05-24, 88d stale, fee EUR 1,050)
  BA 11168 (ended 2026-06-20, 61d stale, fee EUR 700)
  BA 11285 (ended 2026-07-05, 46d stale, fee = null -- confirm before deactivating)
  BA 11352 (ended 2026-07-11, 40d stale, fee EUR 360)
  BA 11179 (ended 2026-08-09, 11d stale, fee EUR 1,360)

Next occupant BA 25 (booking 17844): starts 30 Aug (10 days)

FIX RECIPE (NOT YET RUN):
See Issue 37 (row 39) for full recipe -- steps are identical.
  SQL: UPDATE booking_accommodations SET active = false, updated_at = NOW()
       WHERE id IN (11239, 11168, 11285, 11352, 11179); -- NOT YET RUN
  Confirm BA 11285 fee before running.

RISK: accommodation data-hygiene | Reversible | Low blast radius (5 rows)
URGENCY: Aug 30 conflict window is 10 days
Status: Open -- Fix NOT RUN. Last checked: 2026-08-20 UTC (51st run)
