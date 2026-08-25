Issue 43 -- Jesus Manuel Ramirez Diaz / Bed 83 cluster (student 14439)
Reporter: | Area: Booking/Accommodation | Row 45 | 37th check Mon 17 Aug 2026 UTC

Bed 83 -- 7 active BAs, 5 stale:
  BA 11239: May 3-24 2026, active=true, booking 22 -- STALE 85 days
  BA 11168: Jun 6-20 2026, active=true, booking 92 -- STALE 58 days
  BA 11285: Jun 21-Jul 5 2026, active=true, booking 17825 (Jesus), fee=null -- STALE 43 days
  BA 11352: Jul 4-11 2026, active=true, booking 18156 -- STALE 37 days
  BA 11179: Jul 12-Aug 9 2026, active=true, booking 82 -- STALE 8 days
  BA 11173: Aug 9-30 2026, active=true, booking 88 (Alessandro Signorotti) -- CURRENT OK
  BA 25: Aug 30-Oct 11 2026, active=true, booking 17844 (Rosa Maria Mollica) -- UPCOMING 13 DAYS

FIX RECIPE (NOT YET RUN)

Step 1 -- Deactivate 5 stale BAs (do NOT touch 11173 or 25):
  SELECT id,start_date,end_date,active,booking_id FROM booking_accommodations
    WHERE id IN (11239,11168,11285,11352,11179);
  UPDATE booking_accommodations SET active=false WHERE id IN (11239,11168,11285,11352,11179);

Step 2 -- Set fee on BA 11285 (Jesus, Jun 21-Jul 5, currently null):
  UPDATE booking_accommodations SET fee=<rate> WHERE id=11285;

Risk: Accommodation | Reversible: yes | Blast radius: 5 bookings (5 different students)
Status: Fix NOT RUN. Next check-in bed 83: Rosa Maria Mollica, Aug 30 (13 days).
Last checked: 2026-08-17 UTC (37th check)
