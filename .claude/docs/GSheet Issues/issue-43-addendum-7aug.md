# Issue 43 — Stale Booking Accommodations 11285 + 11352 (addendum 7 Aug 2026)
Reporter: (staff) | Area: Booking / Accommodation | Sheet row: 45

## Symptom
Accommodation dates for Jesus Manuel Ramirez Diaz should be Jun 20–Jul 4. Stale BAs blocking bed 83.

## Root cause
16th check (Fri 7 Aug 2026 UTC) — unchanged from 15th check (Wed 5 Aug).

- Booking accommodation 11285 (Jesus Manuel Ramirez Diaz, booking 17825, bed 83): ended 2026-07-05 — 33 days stale, active = true, fee = null
- Booking accommodation 11352 (Veronica Martin, booking 18156, bed 83): ended 2026-07-11 — 27 days stale, active = true, fee = EUR 360
- Bed 83 appears occupied — blocking future allocations
- Same records also flagged in Issue 37 (row 39) — fix is identical

## Fix recipe (NOT YET RUN)
Run in psql:  UPDATE booking_accommodation SET active = false WHERE id IN (11285, 11352);

## Risk / category
data-hygiene. Reversible. Blast radius: 2 students, cosmetic — frees bed 83.

## Status
Open — BA 11285: 33d stale; BA 11352: 27d stale. Fix NOT RUN.

## Last checked (UTC)
2026-08-07