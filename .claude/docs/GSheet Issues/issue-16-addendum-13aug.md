Issue 16 Addendum 13 Aug 2026 (25th check) -- Stale Booking Accommodations

Reporter: Unknown  Area: Accommodation  Sheet row: 17

Symptom
Four Booking Accommodations remain active past their end dates.

Root cause (25th check -- Thu 13 Aug UTC)
- Booking Accommodation 11216 (booking 46): ended 2026-05-09 -- 96 days stale, active = true, fee EUR 1,440
- Booking Accommodation 11158 (booking 100): ended 2026-05-17 -- 88 days stale, active = true, fee EUR 193.33
- Booking Accommodation 11282 (booking 17897): ended 2026-06-05 -- 69 days stale, active = true, fee EUR 720
  WARNING: BA 11282 starts 2026-05-15, BA 11158 ends 2026-05-17 -- 3-day date overlap on bed 66
- Booking Accommodation 11361 (booking 18190): ended 2026-08-09 -- 4 days stale, active = true, fee EUR 750
- All unchanged from 24th check (Wed 12 Aug)

Fix recipe (NOT YET RUN)
  UPDATE booking_accommodation SET active = false WHERE id IN (11216, 11158, 11282, 11361);
  Verify first: SELECT id, booking_id, start_date, end_date, active, fee FROM booking_accommodation WHERE id IN (11216, 11158, 11282, 11361);

Risk: data-hygiene. Reversible. 4 historical BAs, no current-student impact.

Status: open -- fix NOT RUN. 25 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC