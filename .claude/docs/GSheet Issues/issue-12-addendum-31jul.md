# Issue 12 — Stale Booking Accommodations (115th check)

Reporter: KC · Area: Booking / Accomm · Sheet row: 13

## Root cause (31 Jul 2026)

Three booking_accommodations remain active=true past their end date:
- BA 11162: Massimiliano Cameran (91) bk97, ended 2026-05-23, 69 days stale, EUR 1140, bed 179 Host Family
- BA 11314: Massimiliano Cameran (91) bk18002, ended 2026-06-06, 55 days stale, EUR 480, bed 179 Host Family
- BA 11319: Ernesto Pesoa Gil (14532) bk18034, ended 2026-05-31, 61 days stale, EUR 400, bedId=null (Apartment, single-day record — likely placeholder)

Clean: Rakan Alghamdi BA 11287 (bed 190, Jul 4–Dec 19 2026, active=true legitimately).
Clean: Bernardo Hughes Pimentel (14524) — no stale BAs.

## Fix recipe (NOT YET RUN)

SQL (NOT YET RUN):
UPDATE booking_accommodations SET active=false, updated_at=NOW()
WHERE id IN (11162, 11314, 11319);

## Risk: Data hygiene. Reversible. 3 records, 2 students.
## Status: OPEN — fix NOT RUN — Last checked: Fri 31 Jul 2026 UTC (115th check)
