# Issue 37 — Verónica Martín Stale Booking Accommodations (14th check Tue 4 Aug 2026 UTC)
Reporter: AC | Area: Accommodation | Sheet row: 39

## Root Cause (verified 2026-08-04 UTC, 14th check — unchanged)
- Booking accommodation 11352 (student 278, booking 18156): ended 2026-07-11, active = true — 24 days stale, fee EUR 360.
- Booking accommodation 11285 (booking 17825): ended 2026-07-05, active = true — 30 days stale, fee = null.
- Legacy BAs 9880, 10810, 10811 (2024 dates): active = true — Fidelo migration artifacts, cosmetic.
- Bed 83 currently occupied (Africa Mera Bachir to Aug 9, then Alessandro Signorotti to Aug 30) — stale BAs are cosmetic only.

## Fix Recipe (NOT YET RUN)
  UPDATE booking_accommodations SET active = false WHERE id IN (11285, 11352);
  -- Optional: also deactivate legacy 2024 BAs 9880, 10810, 10811.

## Risk: data-hygiene | Reversible: yes | Blast radius: 2-5 rows (cosmetic only)
## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (14th check)