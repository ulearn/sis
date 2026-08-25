# Issue 37 + 43 -- Bed 83 stale booking accommodations (45th check, Wed 19 Aug 2026 UTC)

Reporter: KC | Area: Accommodation | Sheet rows: 39 (Issue 37) + 45 (Issue 43)

## Symptom
Multiple stale booking accommodations on bed 83 remain active after end dates.

## CORRECTION (Wed 19 Aug 2026)
Previous checks misidentified the upcoming guest as Alessandro Signorotti (BA25).

## Root cause -- verified 19 Aug 2026

### Current occupant (NOT stale, DO NOT deactivate):
- BA11173 (Alessandro Signorotti): Aug 9 to Aug 30 2026, fee EUR 1,080 -- currently in room

### Upcoming check-in (DO NOT deactivate):
- BA25 (Rosa Maria Mollica): Aug 30 to Oct 11 2026, fee EUR 2,100 -- URGENT, 10 days away

### 5 stale BAs to deactivate:
- BA11239 (booking 22, Ivan Rodriguez Solares): ended May 24 -- 87d stale, fee EUR 1,050
- BA11168 (booking 92, Diego Da Silva Saldanha): ended Jun 20 -- 60d stale, fee EUR 700
- BA11285 (booking 17825, Jesus Ramirez): ended Jul 5 -- 45d stale, fee null (CONFIRM FIRST)
- BA11352 (booking 18156, Veronica Martin): ended Jul 11 -- 39d stale, fee EUR 360
- BA11179 (booking 82, Africa Mera Bachir): ended Aug 9 -- 10d stale, fee EUR 1,360

## Fix recipe (NOT YET RUN)
Step 1: Confirm fee for BA11285 with accounts (booking 17825, Jesus Ramirez, Jun 21 to Jul 5).
Step 2: UPDATE booking_accommodations SET fee = <confirmed_fee>, updated_at = NOW() WHERE id = 11285;
Step 3: UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id IN (11239, 11168, 11285, 11352, 11179);
Step 4 verify: SELECT id, active FROM booking_accommodations WHERE id IN (11239, 11168, 11285, 11352, 11179) AND active = true; -- expect 0 rows
Step 5 safety check: SELECT id, active, start_date, end_date FROM booking_accommodations WHERE id IN (11173, 25); -- BA11173 + BA25 must remain active

## Risk
Category: data-hygiene | Reversible: yes (SET active=true) | Blast radius: 5 BA rows
BA11285 fee null -- confirm before deactivating.
DO NOT touch BA11173 (current occupant, ends Aug 30) or BA25 (Rosa Maria Mollica, starts Aug 30).

## Status
Open. 87d max stale. BA11285 fee null. Rosa Maria Mollica check-in Aug 30 (10 days). Fix NOT RUN.
Last checked: Wed 19 Aug 2026 UTC (45th check Issues 37 + 43)
