Issue 16 — Mélie Villard bed 66 stale BAs (addendum 12 Aug 2026)
Sheet row: 17 | Reporter: KC | Area: Booking / Accomm

Symptom
Accommodation dates incorrect on bed 66; system blocked date edits. Four stale booking accommodations remain active.

Root cause (live data — Wed 12 Aug 2026 UTC, 23rd check)
- Booking Accommodation 11216 (booking 46): ended 2026-05-09, 95 days stale, active = true, fee EUR 1,440
- Booking Accommodation 11158 (booking 100): ended 2026-05-17, 87 days stale, active = true, fee EUR 193.33
- Booking Accommodation 11282 (booking 17897): ended 2026-06-05, 68 days stale, active = true, fee EUR 720
  WARNING: BA 11282 starts 2026-05-15, BA 11158 ends 2026-05-17 — 3-day date overlap on bed 66
- Booking Accommodation 11361 (booking 18190): ended 2026-08-09, 3 days stale, active = true, fee EUR 750
  Newly stale since yesterday.

Fix recipe (NOT YET RUN)
  UPDATE booking_accommodation SET active = false WHERE id IN (11216, 11158, 11282, 11361);
  Verify first: SELECT id, booking_id, start_date, end_date, active, fee FROM booking_accommodation WHERE id IN (11216, 11158, 11282, 11361);

Risk / category
Data-hygiene. Reversible. Bed 66 only, 4 historical records. No active student impact — all BAs fully in the past.

Status: open — fix NOT RUN
Last checked: Wed 12 Aug 2026 UTC