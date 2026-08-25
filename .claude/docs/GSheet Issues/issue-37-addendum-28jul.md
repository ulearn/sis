# Issue 37 - Veronica Martin stale BA Addendum 28 Jul 2026

Reporter: KC | Sheet row: 39 | 8th check Tue 28 Jul 2026 UTC

## Root cause

BA 11352 (Veronica Martin, bed 83, booking 18156, 4 Jul-11 Jul 2026): active = true, 17 days post-checkout (was 16d).
BA 11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825, 21 Jun-5 Jul 2026): active = true, fee = null, 23 days post-checkout (was 22d).

Bed 83 occupied by two ended bookings. Cosmetic data hygiene.

## Fix recipe (NOT YET RUN)

  UPDATE booking_accommodation SET active = false WHERE id IN (11352, 11285);

Risk: data-hygiene | Reversible yes | Low blast radius

Status: Open. Fix NOT RUN.