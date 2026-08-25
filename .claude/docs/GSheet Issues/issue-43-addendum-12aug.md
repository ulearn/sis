Issue 43 - Jesus Manuel Ramirez Diaz, Bed 83 Stale BAs (24th check, 12 Aug 2026)

Reporter: KC | Sheet row: 45

Root cause (12 Aug 2026):
BA 11239 Ivan Rodriguez: 80d stale | BA 11168 Diego: 53d | BA 11285 Jesus (fee null): 38d | BA 11352 Veronica: 32d | BA 11179 Africa: 3d
Shared root cause with Issue 37 (same 5 BAs on bed 83).

Fix recipe (NOT YET RUN):
UPDATE booking_accommodations SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);
Confirm BA 11285 fee first. Shared fix with Issue 37.

Risk: bookings/data-hygiene | Reversible: yes | Blast radius: 5 records

Status: Open - 5 stale BAs (80d max). Last checked: 2026-08-12 UTC (24th check)