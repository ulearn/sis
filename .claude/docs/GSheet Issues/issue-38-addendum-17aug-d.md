# Issue 38 — BC25043 stale (184th check, Mon 17 Aug 2026 UTC)
Reporter: Various | Area: Booking/Course | Sheet row: 40

## Root cause (verified)
- Booking Course 25043 (General English PM): ended 2026-08-14 — 3 days stale, active = true
- Student Eduardo Roche Diaz (14602), Booking 18265: CONFIRMED
- 0 student class assignments on this booking course

## Fix recipe (NOT YET RUN)
  UPDATE booking_course SET active = false WHERE id = 25043;
  Verify: SELECT id, name, end_date, active FROM booking_course WHERE id = 25043;
  Expect: active = false

## Risk: Data-hygiene | Reversible | Blast radius: 1 BC, 0 SCAs — safe
## Status: OPEN — Fix NOT RUN | Last checked: Mon 17 Aug 2026 UTC (184th check)