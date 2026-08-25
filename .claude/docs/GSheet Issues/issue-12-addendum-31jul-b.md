Issue 12 - Stale Booking Accommodations (116th check 31 Jul 2026)
3 stale BAs unchanged:
BA 11162: Massimiliano Cameran, bk97, bed179 (Host Family), Apr 21-May 23 2026, fee EUR 1140 -- 69d stale
BA 11314: Massimiliano Cameran, bk18002, bed179 (Host Family), May 23-Jun 6 2026, fee EUR 480 -- 55d stale
BA 11319: Ernesto Pesoa Gil, bk18034, bed=null, May 31-May 31 2026 (zero-duration), fee EUR 400 -- 61d stale

Fix recipe - NOT YET RUN:
UPDATE booking_accommodations SET active = false WHERE id IN (11162, 11314, 11319);
Verify: SELECT id, active, start_date, end_date, fee, bed_id FROM booking_accommodations WHERE id IN (11162, 11314, 11319);
Optional for BA 11319 (zero-duration no bed): UPDATE booking_accommodations SET fee = 0 WHERE id = 11319;
Risk: data-hygiene. Reversible. Blast radius: 3 records, frees bed 179.
Last checked: 2026-07-31 UTC (116th check)