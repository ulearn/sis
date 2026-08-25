Issue 21 - BC1604 stale - 30 Jul 2026 UTC (9th check)
-------------------------------------------------------
Root cause (unchanged):
- Booking course 1604 (Morning General, booking 1461): active=true, ended 3 Jul 2026 -- 27 days stale.
- No class-assignment anomaly -- cosmetic staleness only.

Fix recipe (NOT YET RUN):
UPDATE booking_course SET active = false WHERE id = 1604;

Risk: data-hygiene; cosmetic; reversible. Status: OPEN - unchanged since 28 Jul 2026.
Last checked: Thu 30 Jul 2026 UTC
