# Issue 37 Addendum 13 Aug 2026 (27th check)

Reporter: KC  Area: Booking/Accomm  Sheet row: 39

## Root Cause (27th check -- confirmed Thu 13 Aug UTC)
Bed 83 has 5 stale Booking Accommodations still marked active=true:
- BA 11239 (Ivan Rodriguez Solares): ended 2026-05-24, 81 days stale
- BA 11168 (Diego Da Silva Saldanha): ended 2026-06-20, 54 days stale
- BA 11285 (Jesus Manuel Ramirez Diaz): ended 2026-07-05, 39 days stale, fee NULL
- BA 11352 (Veronica Martin): ended 2026-07-11, 33 days stale
- BA 11179 (Africa Mera Bachir): ended 2026-08-09, 4 days stale

Current valid occupants:
- BA 11173 (Alessandro Signorotti): 9 Aug to 30 Aug 2026, fee EUR 1,080
- BA 25 (Rosa Maria Mollica): 30 Aug to 11 Oct 2026, fee EUR 2,100 (future)

## Fix Recipe -- NOT YET RUN

Step 1: Confirm BA 11285 fee (null) with KC/Diego.
Step 2 (NOT YET RUN): Deactivate 5 stale BAs:
  UPDATE booking_accommodation SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);
Step 3: Verify -- SELECT id, active FROM booking_accommodation WHERE id IN (11239, 11168, 11285, 11352, 11179); -- expect 5 x false

## Risk
Category: data-hygiene. Reversible. Blast radius: 5 records on bed 83.
Note: BA 11285 fee null -- confirm before deactivating.

## Status
Fix NOT RUN. 27 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC
