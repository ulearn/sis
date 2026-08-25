# Issue 16 — Bed 66 Stale Booking Accommodations (21st check, Tue 11 Aug 2026 UTC)
Reporter: Staff | Area: Accommodation | Sheet row: 17

## Status
Unchanged from 20th check (Mon 10 Aug 2026). 4 stale BAs. Max staleness 94 days.

## Root Cause
- Booking Accommodation 11216 (booking 46): ended 2026-05-09 — 94 days stale, active = true
- Booking Accommodation 11158 (booking 100): ended 2026-05-17 — 86 days stale, active = true
- Booking Accommodation 11282 (booking 17897): ended 2026-06-05 — 67 days stale, active = true
- Booking Accommodation 11361 (booking 18190): ended 2026-08-09 — 2 days stale, active = true
- Bed 66 is free from Mon 10 Aug 2026 — available for reassignment

## Fix Recipe (NOT YET RUN)
Step 1 — Deactivate the 4 stale Booking Accommodations:
  UPDATE booking_accommodations SET active = false WHERE id IN (11361, 11282, 11158, 11216);

Step 2 — Verify:
  SELECT id, end_date, active FROM booking_accommodations WHERE id IN (11361, 11282, 11158, 11216);
  Expected: all active = false.

## Risk / Category
Accommodation / data-hygiene. Reversible. Blast radius: 4 ended stays on bed 66 only.

## Last checked: 2026-08-11 UTC