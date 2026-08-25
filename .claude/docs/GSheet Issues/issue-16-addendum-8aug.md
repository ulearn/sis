# Issue 16 addendum 8 Aug

BA 11282 (Melie Villard, booking 17897, bed 66): ended 2026-06-05, 64d stale, active=true, fee=EUR 720.
BA 11158 (Hugo Tavernier, bed 66): ended 2026-05-17, 83d stale, active=true.
BA 11216 (Erii Takigawa, bed 66): ended 2026-05-09, 91d stale, active=true.
BA 11361 (Filippo Corazzini): ends 2026-08-09 (tomorrow) -- bed 66 free from Mon Aug 10.

FIX NOT RUN:
  UPDATE booking_accommodation SET active = false WHERE id IN (11282, 11158, 11216);

Verify: SELECT id, active, end_date FROM booking_accommodation WHERE id IN (11282, 11158, 11216);

Risk: data-hygiene, reversible. Blast radius: 3 stale records on bed 66, cosmetic only.
Last checked: 2026-08-08 UTC