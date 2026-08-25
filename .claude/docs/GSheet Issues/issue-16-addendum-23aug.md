# Issue 16 — Mélie Villard — Stale BAs Bed 66 — 34th check

Reporter: NM | Sheet row: 17 | Last checked: 2026-08-23 UTC

## Root Cause (no change since 33rd Sat 22 Aug)
All 4 BAs still active — Prisma query 2026-08-23 UTC:
- BA 11216 (booking 46, bed 66): endDate 2026-05-09 — 106 days stale, fee EUR 1,440
- BA 11158 (booking 100, bed 66): endDate 2026-05-17 — 98 days stale, fee EUR 193.33
- BA 11282 (booking 17897, bed 66): endDate 2026-06-05 — 79 days stale, fee EUR 720
- BA 11361 (booking 18190, bed 66): endDate 2026-08-09 — 14 days stale, fee EUR 750
Bed 66 free since 9 Aug 2026. All parent bookings CONFIRMED.

## Fix Recipe (NOT YET RUN)
NOTE: table name is booking_accommodations (plural) — raw SQL required.
Pre-check: Verify Xero reconciliation for BA 11216 (EUR 1,440) and BA 11282 (EUR 720).
Deactivate: UPDATE booking_accommodations SET active = false WHERE id IN (11216, 11158, 11282, 11361);
Undo: UPDATE booking_accommodations SET active = true WHERE id IN (11216, 11158, 11282, 11361);

## Risk
Data hygiene. Reversible. Low blast radius.

## Status
Fix NOT RUN. BA 11216 now 106d stale (max). Bed 66 free since 9 Aug 2026.
Last checked: 2026-08-23 UTC (34th check).