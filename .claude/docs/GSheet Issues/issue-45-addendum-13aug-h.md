# Issue 45 — 24,479 stale Booking Courses (84th check Thu 13 Aug 2026 UTC)

No change since 83rd check. Stale count unchanged at 24,479. Live BCs: 285 (unchanged).

## Evidence
- Stale active BCs (endDate < 2026-08-13): 24,479 (unchanged)
- Live active BCs (endDate >= 2026-08-13): 285 (unchanged)

## Fix (NOT YET RUN)
SELECT COUNT(*) FROM booking_course WHERE active = true AND end_date < CURRENT_DATE;
UPDATE booking_course SET active = false WHERE active = true AND end_date < CURRENT_DATE;

Risk: Data hygiene, reversible, 24479 rows
Last checked: Thu 13 Aug 2026 UTC (84th check)