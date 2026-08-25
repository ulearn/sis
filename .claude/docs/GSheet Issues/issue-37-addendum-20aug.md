Issue 37 -- Veronica (bed 83 stale BAs) (addendum 20 Aug 2026)
Reporter: KC | Area: Booking/Accomm | Sheet row: 39 | Run: 52nd

ROOT CAUSE (52nd check, Thu 20 Aug 2026 UTC -- no change from 51st):
- 5 stale Booking Accommodations on bed 83 all active past end dates:
  BA 11239 (booking 22): ended 2026-05-24 (88 days stale), fee EUR 1,050
  BA 11168 (booking 92): ended 2026-06-20 (61 days stale), fee EUR 700
  BA 11285 (booking 17825): ended 2026-07-05 (46 days stale), fee = null -- confirm before deactivating
  BA 11352 (booking 18156): ended 2026-07-11 (40 days stale), fee EUR 360
  BA 11179 (booking 82): ended 2026-08-09 (11 days stale), fee EUR 1,360

- Current occupant BA 11173 (booking 88): 9 Aug to 30 Aug, fee EUR 1,080 -- active, legitimate
- Next occupant BA 25 (booking 17844): starts 30 Aug (10 days), fee EUR 2,100 -- conflict imminent if stale BAs not cleared

FIX RECIPE (NOT YET RUN):
Step 0 -- Confirm fee for BA 11285 with accounts before deactivating (fee currently null)

Step 1 -- Deactivate 5 stale BAs
  SQL: UPDATE booking_accommodations SET active = false, updated_at = NOW()
       WHERE id IN (11239, 11168, 11285, 11352, 11179); -- NOT YET RUN

Step 2 -- Verify (should return 0 rows)
  SQL: SELECT id, end_date, active FROM booking_accommodations
       WHERE id IN (11239, 11168, 11285, 11352, 11179) AND active = true;

Step 3 -- Confirm current + future still active
  SQL: SELECT id, start_date, end_date, active FROM booking_accommodations WHERE id IN (11173, 25);

RISK: accommodation data-hygiene | Reversible | BA 11285 fee null needs confirming first
URGENCY: Aug 30 conflict window is 10 days away
Status: Open -- Fix NOT RUN. Last checked: 2026-08-20 UTC (52nd run)
