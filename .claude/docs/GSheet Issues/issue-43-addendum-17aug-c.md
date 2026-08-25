Issue 43 -- Bed 83 stale BAs + Aug 30 check-in (39th check, 17 Aug 2026 UTC)
Reporter: Various | Area: Booking/Accomm | Sheet row: 45

Symptom: Bed 83 has 5 stale active booking accommodations; Aug 30 incoming booking approaching.

Root cause (live DB, 17 Aug 2026)
Stale active BAs on bed 83:
- BA 11239: booking 22, 2026-05-03 to 2026-05-24, fee EUR 1050 -- 85 days stale
- BA 11168: booking 92, 2026-06-06 to 2026-06-20, fee EUR 700 -- 58 days stale
- BA 11285: booking 17825 (Jesus Manuel Ramirez Diaz), 2026-06-21 to 2026-07-05, fee null -- 43 days stale
- BA 11352: booking 18156, 2026-07-04 to 2026-07-11, fee EUR 360 -- 37 days stale
- BA 11179: booking 82, 2026-07-12 to 2026-08-09, fee EUR 1360 -- 8 days stale
Current occupant (unaffected):
- BA 11173: booking 88, 2026-08-09 to 2026-08-30, fee EUR 1080 -- in progress
Upcoming check-in (13 days):
- BA 25: booking 17844, 2026-08-30 to 2026-10-11, fee EUR 2100 -- arrives Aug 30

Fix recipe (NOT YET RUN)
Step 1 -- Deactivate 5 stale BAs:
  UPDATE booking_accommodations SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);
Step 2 -- BA 11285 has fee null; confirm with KC before closing whether a fee applies.
Step 3 -- Verify: SELECT id,booking_id,start_date,end_date,fee,active FROM booking_accommodations WHERE bed_id=83 AND active=true ORDER BY start_date;
Expected: only BA 11173 (current) and BA 25 (upcoming).

Risk: Data-hygiene | Reversible | Blast radius: 5 stale BAs | Deadline: Aug 30 (13 days)
Status: OPEN -- fix NOT RUN. 5 stale BAs (85d max). Aug 30 check-in 13d. 39th check 17 Aug 2026 UTC.