# Issue 37 - Veronica Martin / Bed 83 Stale BAs (26th check 12 Aug 2026)

Reporter: AC  Area: Booking/Accomm  Sheet row: 39

## Symptom
Accommodation not appearing in SIS. Original resolved; 5 stale BAs on bed 83 remain.

## Root Cause (unchanged)
5 stale Booking Accommodations on bed 83 (all active=true):
- BA 11179 (Africa Mera Bachir): ended 9 Aug 2026 -- 3 days stale
- BA 11352 (Veronica Martin): ended 11 Jul 2026 -- 32 days stale
- BA 11285 (Jesus Manuel Ramirez Diaz): ended 5 Jul 2026 -- 38 days stale, fee=null
- BA 11168 (Diego Da Silva Saldanha): ended 20 Jun 2026 -- 53 days stale
- BA 11239 (Ivan Rodriguez Solares): ended 24 May 2026 -- 80 days stale
Current: BA 11173 (Alessandro Signorotti, 9-30 Aug 2026, fee EUR 1080)
Future: BA 25 (Rosa Maria Mollica, 30 Aug - 11 Oct 2026, fee EUR 2100)

## Fix Recipe - NOT YET RUN

Step 1 - Confirm BA 11285 fee (Jesus, fee=null) before deactivating.

Step 2 - Deactivate 5 stale BAs:
  UPDATE booking_accommodations SET active=false WHERE id IN (11239,11168,11285,11352,11179);

Verify after:
  SELECT id,start_date,end_date,active,fee FROM booking_accommodations WHERE bed_id=83 ORDER BY start_date DESC;

## Risk
Category: data-hygiene/bookings. Reversible. Current (11173) and future (25) unaffected.

## Status
Fix NOT RUN. 5 stale BAs, max 80 days. Unchanged 26 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC (26th check, run 221)