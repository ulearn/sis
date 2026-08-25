# Issue 37 -- Bed 83 stale Booking Accommodations (Veronica Martin lead)
Reporter: | Area: Booking/Accommodation | Row 39 | 42nd check Mon 17 Aug 2026 UTC

Symptom: Bed 83 has 5 Booking Accommodations with past end dates still active = true.
Current occupant Alessandro Signorotti checks out 30 Aug 2026 (13 days). Rosa Maria Mollica checks in same day.

Root Cause: Five historical BAs on bed 83 were never deactivated after checkout.
  BA 11239: Ivan Rodriguez, May 3-24 2026, fee EUR 1,050 -- 85 days stale
  BA 11168: Diego Da Silva Saldanha, Jun 6-20 2026, fee EUR 700 -- 58 days stale
  BA 11285: Jesus Ramirez Diaz, Jun 21-Jul 5 2026, fee = null -- 43 days stale (fee also missing)
  BA 11352: Veronica Martin, Jul 4-11 2026, fee EUR 360 -- 37 days stale
  BA 11179: Africa Mera Bachir, Jul 12-Aug 9 2026, fee EUR 1,360 -- 8 days stale
  BA 11173: Alessandro Signorotti Aug 9-30 2026 -- CURRENT OK (do not touch)
  BA 25: Rosa Maria Mollica Aug 30-Oct 11 2026 -- UPCOMING 13d (do not touch)

Fix Recipe (NOT YET RUN):

Step 1 -- Verify:
  SELECT id, start_date, end_date, active, fee FROM booking_accommodations WHERE id IN (11239, 11168, 11285, 11352, 11179);

Step 2 -- Set fee on BA 11285 (confirm rate with Neil, approx EUR 700 for 2 weeks):
  UPDATE booking_accommodations SET fee = <rate> WHERE id = 11285;

Step 3 -- Deactivate 5 stale BAs (do NOT touch 11173 or 25):
  UPDATE booking_accommodations SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);

Step 4 -- Verify aftermath:
  SELECT id, start_date, end_date, active, fee FROM booking_accommodations WHERE bed_id = 83 ORDER BY start_date;

Risk: Accommodation | Reversible: yes | Blast radius: 5 historical bookings, all checked out, no live student impact
Status: Fix NOT RUN. Next check-in bed 83: Rosa Maria Mollica 30 Aug 2026 (13 days).
Last checked: 2026-08-17 UTC (42nd check)