# Issue 43 - Jesus Manuel Ramirez Diaz stale BA Addendum 28 Jul 2026

Reporter: KC | Sheet row: 45 | 11th check Tue 28 Jul 2026 UTC

## Root cause

BA 11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): ended 5 Jul 2026 - 23 days post-checkout - active = true, fee = null.
BA 11352 (Veronica Martin, bed 83, booking 18156): ended 11 Jul 2026 - 17 days post-checkout - active = true.

Same fix as Issue 37 - both BAs share bed 83.

## Fix recipe (NOT YET RUN)

  UPDATE booking_accommodation SET active = false WHERE id IN (11285, 11352);

Risk: data-hygiene | Reversible yes | Low blast radius

Status: Open. Fix NOT RUN.