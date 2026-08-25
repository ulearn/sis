Issue 37 -- Verónica Martín bed 83 stale BAs (addendum 20 Aug 2026, 53rd check)
Reporter: Diego/KC | Area: Booking/Accomm | Sheet rows: 39 (issue 37) and 45 (issue 43 duplicate)

ROOT CAUSE (53rd check, Thu 20 Aug 2026 UTC):
- 5 stale Booking Accommodations on bed 83, all still active:
  BA 11239 (booking 22): ended 24 May 2026 -- 89 days stale, fee EUR 1,050, safe to deactivate
  BA 11168 (booking 92): ended 20 Jun 2026 -- 61 days stale, fee EUR 700, safe to deactivate
  BA 11285 (booking 17825, Jesús Manuel Ramírez Díaz): ended 5 Jul 2026 -- 46 days stale, fee NULL
    Note: booking 17825 is CONFIRMED, fully paid EUR 2,008, amountOpen = 0 -- fee was omitted in error; confirm correct amount before deactivating
  BA 11352 (booking 18156): ended 11 Jul 2026 -- 40 days stale, fee EUR 360, safe to deactivate
  BA 11179 (booking 82): ended 9 Aug 2026 -- 11 days stale, fee EUR 1,360, safe to deactivate
- Current occupant BA 11173 (booking 88): 9 Aug to 30 Aug 2026, fee EUR 1,080, active -- active and correct
- Next occupant BA 25 (booking 17844): starts 30 Aug 2026 -- 10 days away, fee EUR 2,100, active
- All 5 stale BAs must be deactivated before 30 Aug to prevent allocation conflicts

FIX RECIPE (NOT YET RUN):
Step 1 -- Determine correct fee for BA 11285 (1 week bed 83, 21 Jun to 5 Jul, booking 17825, Jesús Manuel)
  Booking 17825 is fully paid EUR 2,008; confirm what portion covers accommodation vs course

Step 2 -- Set fee on BA 11285 if missing, then deactivate all 5 stale BAs
  SQL: UPDATE booking_accommodations SET fee = <AMOUNT>, updated_at = NOW() WHERE id = 11285; -- NOT YET RUN (confirm amount first)
  SQL: UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id IN (11239, 11168, 11285, 11352, 11179); -- NOT YET RUN

Step 3 -- Verify bed 83 timeline
  SQL: SELECT id, booking_id, start_date, end_date, fee, active FROM booking_accommodations WHERE bed_id = 83 ORDER BY start_date;

RISK: bookings/accommodation | Reversible | Blast radius: 5 historical bookings (beds 83)
URGENCY: Moderate -- must resolve before 30 Aug (10 days) to avoid conflict with BA 25
Status: Open -- Fix NOT RUN. Last checked: 2026-08-20 UTC (53rd check)
