Issue 43 -- Stale Booking Accommodations on Bed 83

Reporter: KC | Area: Booking/Accomm | Sheet row: 45
27th check -- Thu 13 Aug 2026 UTC

Symptom: Multiple past-ended accommodation records on bed 83 still active=true.

Root Cause: 5 stale BAs on bed 83 (unchanged since 26th check Wed 12 Aug):
- BA 11239 (Ivan Rodriguez Solares): ended 2026-05-24, 81 days stale, fee EUR 1050
- BA 11168 (Diego Da Silva Saldanha): ended 2026-06-20, 54 days stale, fee EUR 700
- BA 11285 (Jesus Manuel Ramirez Diaz): ended 2026-07-05, 39 days stale, fee null
- BA 11352 (Veronica Martin): ended 2026-07-11, 33 days stale, fee EUR 360
- BA 11179 (Africa Mera Bachir): ended 2026-08-09, 4 days stale, fee EUR 1360
Current occupant: BA 11173 (Alessandro Signorotti, 9-30 Aug 2026) -- active, correct.
Future: BA 25 (Rosa Maria Mollica, 30 Aug to 11 Oct 2026).

Fix Recipe (NOT YET RUN):
Step 1: Confirm BA 11285 fee with Diego (currently null).
Step 2: UPDATE booking_accommodations SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);

Risk: data-hygiene | Reversible: yes | Blast radius: bed 83 history view only

Status: OPEN | Last checked: Thu 13 Aug 2026 UTC (27th check)
Previous recipe: issue-43-addendum-12aug-c.md