# Issue 36b addendum -- Mon 20 Jul 2026 (29th check)

Area: Booking / Accommodation | Sheet row 38

## Current status (fresh DB Mon 20 Jul 2026 UTC)
All 6 booking accommodations STILL active past their end date:
- BA 11265 (Kanna Hasegawa, bed 157): ended 19 Jul 2026 -- 1 day post-checkout
- BA 11175 (Juan Carlos Guerra Nunez): ended 29 Mar 2026 -- 113 days stale
- BA 11156 (Hugo Tavernier): ended 2 May 2026 -- 79 days stale
- BA 11271 (Salvatore Cumia): ended 7 May 2026 -- 74 days stale
- BA 11264 (Leandre Le Coz-Brühmüller): ended 9 May 2026 -- 72 days stale
- BA 11270 (Neil Mc Mahon): ended 23 May 2026 -- 58 days stale

Note: B column on sheet was updated since last run (hash changed).

## Fix recipe (NOT YET RUN)
SQL: UPDATE booking_accommodation SET active = false WHERE id IN (11265, 11156, 11175, 11264, 11270, 11271);

## Risk
bookings / data-hygiene -- reversible (set active = true to undo). Zero financial risk. Affects accommodation allocation view only.

## Status
OPEN. Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC.

Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC (33rd check, 11th today).