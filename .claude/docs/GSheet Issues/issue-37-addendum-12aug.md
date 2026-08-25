Issue 37 - Veronica Martin, Bed 83 Stale BAs (23rd check, 12 Aug 2026)

Reporter: KC | Sheet row: 39

Root cause (12 Aug 2026):
BA 11239 Ivan Rodriguez: ended 24 May, 80d stale, fee EUR 1050
BA 11168 Diego Da Silva: ended 20 Jun, 53d stale, fee EUR 700
BA 11285 Jesus Manuel: ended 5 Jul, 38d stale, fee null
BA 11352 Veronica Martin: ended 11 Jul, 32d stale, fee EUR 360
BA 11179 Africa Mera Bachir: ended 9 Aug, 3d stale, fee EUR 1360
Current bed 83: BA 11173 (Alessandro, Aug 9-30), BA 25 (Rosa Maria, Aug 30-Oct 11)

Fix recipe (NOT YET RUN):
UPDATE booking_accommodations SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);
Confirm fee for BA 11285 (null) first. Shared fix with Issue 43.

Risk: bookings/data-hygiene | Reversible: yes | Blast radius: 5 records

Status: Open - 5 stale BAs (80d max). Last checked: 2026-08-12 UTC (23rd check)