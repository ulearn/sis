# Issue 50 — 143 Stale Active Booking Accommodations (21st check, 22 Aug 2026)

**Sheet row:** 52

## Root cause
- 143 stale 2026 BAs (end date before 22 Aug 2026, start >= 1 Jan 2026), active = true.
- Down from 149 on Fri 21 Aug (6 resolved overnight).
- Oldest stale: BA 11237, ended 31 Jan 2026, fee EUR 1,400, bedId = null.
- Total including legacy: approximately 11,194 stale BAs.

## Fix recipe (NOT YET RUN)
- Preview: SELECT COUNT(*), MIN(end_date), MAX(end_date) FROM booking_accommodation WHERE active = true AND end_date < 2026-08-22 AND start_date >= 2026-01-01;
- Bulk deactivate (ROLLBACK first to verify, then COMMIT):
    BEGIN; UPDATE booking_accommodation SET active = false WHERE active = true AND end_date < 2026-08-22 AND start_date >= 2026-01-01; COMMIT;
- Inspect BA 11237 (bedId null): SELECT id, booking_id, start_date, end_date, fee FROM booking_accommodation WHERE id = 11237;
- Post-fix verify: SELECT COUNT(*) FROM booking_accommodation WHERE active = true AND end_date < 2026-08-22 AND start_date >= 2026-01-01; -- expected 0

## Risk
Accommodations/data-hygiene. Reversible. 143 records across multiple bookings.

**Last checked:** Sat 22 Aug 2026 UTC (21st check)