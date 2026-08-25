Issue 43 -- Jesus Manuel Ramirez Diaz (Bed 83 Stale BA)

Reporter: KC | Area: Booking/Accomm | Sheet row: 45
Last checked: 2026-08-25 UTC (519th run)

ROOT CAUSE (current)
Booking Accommodation 11285 (Jesus Manuel Ramirez Diaz, bed 83): ended 5 Jul 2026, active = true -- 51d stale, fee = null.
One of 5 stale BAs on bed 83 (see issue-37-addendum-25aug.md for full list + fix recipe).

Current: Alessandro Signorotti (BA11173, ends 30 Aug 2026) -- 5 DAYS.
Next: Rosa Maria Mollica (BA25, starts 30 Aug 2026) -- 5 DAYS.
BA11285: cleanedAt set (6 Jul 2026), fee still null.

FIX RECIPE (NOT YET RUN)
See issue-37-addendum-25aug.md -- combined fix for all 5 stale BAs on bed 83.

Specific to Issue 43:
1. Deactivate BA11285 (included in batch for all 5):
   UPDATE booking_accommodation SET active = false WHERE id = 11285;
2. Set fee -- confirm with KC: Jesus Manuel, Jun 21 to Jul 5 (2 weeks):
   UPDATE booking_accommodation SET fee = <rate_x_2_weeks> WHERE id = 11285;

RISK: Data-hygiene / accommodation. Reversible. DEADLINE: 30 Aug 2026 (5 days).
STATUS: Fix NOT RUN.
