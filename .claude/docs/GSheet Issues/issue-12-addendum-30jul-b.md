## Issue 12 addendum 2026-07-30 (114th check)
Hash change: column B updated with student IDs. Data unchanged.
BA 11162: Massimiliano Cameran (s91) bk97 bed179, ended 2026-05-23, 68d stale, active=true, EUR 1140
BA 11314: Massimiliano Cameran (s91) bk18002 bed179, ended 2026-06-06, 54d stale, active=true, EUR 480
BA 11319: Ernesto Pesoa Gil (s14532) bk18034 bed=null, ended 2026-05-31, 60d stale, active=true, EUR 400
Rakan 14444: no stale BAs. Bernardo 14524: no stale BAs.

Fix (NOT YET RUN):
UPDATE booking_accommodations SET active=false, updated_at=NOW() WHERE id IN (11162,11314,11319);

Risk: data-hygiene, reversible, 3 records.
Status: NOT YET RUN. 2026-07-30 UTC (114th check).