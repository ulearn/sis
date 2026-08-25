# Issue 37 — Veronica Martin: Two stale booking accommodations blocking bed 83 (23d + 29d)

Reporter: (various)  Area: Booking / Accomm  Sheet row: 39

## Root cause (confirmed 2026-08-03 UTC)
- Booking accommodation 11352 (Veronica Martin, bed 83, booking 18156): end date 2026-07-11 — 23 days post-checkout, active = true, fee = EUR 360.
- Booking accommodation 11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): end date 2026-07-05 — 29 days post-checkout, active = true, fee = null.
- Bed 83 double-blocked; no new allocation possible until both deactivated.
- Days stale increased from 21d+27d (Sat 1 Aug) to 23d+29d.

## Fix recipe (NOT YET RUN)

Step 1 — Confirm correct fee for BA 11285 (2 weeks Jun 21 to Jul 5) with accounts (NOT YET RUN):
  SELECT id, start_date, end_date, fee, booking_id FROM booking_accommodation WHERE id = 11285;

Step 2 — Set fee on BA 11285 if confirmed (NOT YET RUN):
  UPDATE booking_accommodation SET fee = <amount> WHERE id = 11285;

Step 3 — Deactivate both stale booking accommodations (NOT YET RUN):
  UPDATE booking_accommodation SET active = false WHERE id IN (11285, 11352);

Step 4 — Verify bed 83 is clear (NOT YET RUN):
  SELECT id, active FROM booking_accommodation WHERE bed_id = 83 AND active = true;
  -- Should return 0 rows.

## Risk
Category: data-hygiene (cosmetic). Reversible: yes. Blast radius: 1 bed, 2 accommodation records.

## Status: OPEN — BA 11352 23d stale, BA 11285 29d stale (fee=null), bed 83 blocked
Last checked: 2026-08-03 UTC (12th hourly check)
