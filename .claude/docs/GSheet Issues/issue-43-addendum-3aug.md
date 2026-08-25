# Issue 43 — Jesus Manuel Ramirez Diaz: Stale booking accommodation 11285 (29 days, fee = null)

Reporter: (various)  Area: Booking / Accomm  Sheet row: 45

## Root cause (confirmed 2026-08-03 UTC)
- Booking accommodation 11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): end date 2026-07-05 — 29 days post-checkout, active = true, fee = null.
- Booking accommodation 11352 (Veronica Martin, bed 83, booking 18156): end date 2026-07-11 — 23 days post-checkout, active = true.
- 1-day date discrepancy vs requested dates is a known DST migration artefact; low priority.
- Both BAs share bed 83 — same fix as Issue 37 (row 39).
- Days stale increased from 24d (Wed 29 Jul) to 29d.

## Fix recipe (NOT YET RUN)
See also issue-37-addendum-3aug.md for the shared fix.

Step 1 — Confirm fee for BA 11285 with accounts (NOT YET RUN):
  SELECT id, start_date, end_date, fee FROM booking_accommodation WHERE id = 11285;

Step 2 — Deactivate BA 11285 and 11352 (NOT YET RUN):
  UPDATE booking_accommodation SET active = false WHERE id IN (11285, 11352);

Step 3 — Verify (NOT YET RUN):
  SELECT id, active FROM booking_accommodation WHERE id IN (11285, 11352);

## Risk
Category: data-hygiene (cosmetic). Reversible: yes. Blast radius: 1 bed, 2 accommodation records.

## Status: OPEN — BA 11285 29d stale (fee=null), BA 11352 23d stale; bed 83 blocked
Last checked: 2026-08-03 UTC (13th hourly check)
