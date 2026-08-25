# Issue 43 — Bed 83 Stale BAs (Addendum 9 Aug)

Reporter: Staff | Area: Booking/Accomm | Sheet row: 45 | Check: 18th, Sun 9 Aug 2026 UTC

## Symptom
Bed 83 has multiple stale Booking Accommodations (active=true past end date).

## Root Cause — 5 stale BAs as of today
BA 11239 (Ivan Rodriguez Solares): ended 2026-05-24, 76 days stale
BA 11168 (Diego Da Silva Saldanha): ended 2026-06-20, 49 days stale
BA 11285 (Jesus Manuel Ramirez Diaz): ended 2026-07-05, 34 days stale
BA 11352 (Veronica Martin): ended 2026-07-11, 28 days stale
BA 11179 (Africa Mera Bachir): ended 2026-08-09 TODAY, just became stale

Current (do NOT deactivate): BA 11173 (Alessandro Signorotti, Aug 9-30), BA 25 (Rosa Maria Mollica, Aug 30-Oct 11)

## Fix Recipe (NOT YET RUN)

UPDATE booking_accommodations SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);

## Risk
Category: data-hygiene (cosmetic) | Reversible: yes (SET active=true)

## Status
Open — fix NOT RUN. Last checked: Sun 9 Aug 2026 UTC (18th check)