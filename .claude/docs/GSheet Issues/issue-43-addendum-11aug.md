# Issue 43 Addendum 11 Aug 2026 (23rd check)

Tue 11 Aug 2026 UTC. Unchanged from 22nd check (Mon 10 Aug).

## Root Cause
5 Booking Accommodations on bed 83 still active=true despite having ended:
- BA 11239 (booking 22, Ivan Rodriguez): ended 2026-05-24, 79 days stale
- BA 11168 (booking 92, Diego Da Silva Saldanha): ended 2026-06-20, 52 days stale
- BA 11285 (booking 17825): ended 2026-07-05, 37 days stale
- BA 11352 (booking 18156): ended 2026-07-11, 31 days stale
- BA 11179 (booking 82): ended 2026-08-09, 2 days stale (newly stale since Mon 9 Aug)

## Fix Recipe (NOT YET RUN)
UPDATE booking_accommodation SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);

Verify current active occupant of bed 83 before running.

## Risk: data-hygiene, reversible, cosmetic only (bed 83 availability display)

**Last checked:** Tue 11 Aug 2026 UTC (23rd check)
