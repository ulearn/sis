Issue 16 addendum — 9 Aug 2026 (17th check)

Reporter: KC | Area: Booking / Accomm | Row: 17

BA 11361 (Filippo Corazzini, booking 18190) ended today (2026-08-09) — now stale.
Bed 66 now has 4 stale active booking accommodations. No future BAs — bed free from Mon 10 Aug.

Stale BAs on bed 66 (all active = true):
  BA 11361 (Filippo Corazzini, booking 18190): ended 2026-08-09 — just ended today
  BA 11282 (Melie Villard, booking 17897): ended 2026-06-05 — 65 days stale, fee EUR 720
  BA 11158 (Hugo Tavernier, booking 100): ended 2026-05-17 — 84 days stale
  BA 11216 (Erii Takigawa, booking 46): ended 2026-05-09 — 92 days stale

No future BAs assigned to bed 66. Bed free from Mon 10 Aug.

Fix recipe (NOT YET RUN):
  UPDATE booking_accommodations SET active = false WHERE id IN (11361, 11282, 11158, 11216);

Verify:
  SELECT id, start_date, end_date, active FROM booking_accommodations WHERE id IN (11361, 11282, 11158, 11216);

Risk: data-hygiene | reversible | Blast radius: 4 stale BA records on bed 66, cosmetic only

OPEN — fix NOT RUN. 4 stale BAs; bed 66 free from Aug 10.
Last checked: 2026-08-09 UTC (17th hourly check)