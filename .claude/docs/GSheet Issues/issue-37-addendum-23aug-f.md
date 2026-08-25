Issue 37 -- Bed 83 Stale BAs (476th run, 23 Aug 2026 UTC)
Reporter: KC | Sheet rows 39+45

Root cause: 5 stale Booking Accommodations on bed 83, no DB change since 474th run.
BA 11239 (Ivan Rodriguez Solares): ended 24 May 2026 -- 91d stale, fee EUR 1050
BA 11168 (Diego Da Silva Saldanha): ended 20 Jun 2026 -- 64d stale, fee EUR 700
BA 11285 (Jesus Manuel Ramirez Diaz): ended 5 Jul 2026 -- 49d stale, fee null
BA 11352 (Veronica Martin): ended 11 Jul 2026 -- 43d stale, fee EUR 360
BA 11179 (Africa Mera Bachir): ended 9 Aug 2026 -- 14d stale, fee EUR 1360
DO NOT TOUCH: BA 11173 (ends 30 Aug) and BA 25 (starts 30 Aug, next occupant Rosa Maria Mollica, 7 DAYS)

Fix recipe (NOT YET RUN)
UPDATE booking_accommodations SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);
Verify: SELECT id, start_date, end_date, active FROM booking_accommodations WHERE bed_id = 83 ORDER BY start_date;

Risk: data-hygiene | Reversible: SET active=true | DEADLINE 30 Aug (7 days)
Status: FIX NOT RUN.
Last checked: 2026-08-23 UTC (476th run)
