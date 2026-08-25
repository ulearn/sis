# Issue 38 -- BC25043 stale (188th check, Wed 19 Aug 2026)

Reporter: | Area: Booking Course | Sheet row: 40

## Symptom
Stale active Booking Course preventing correct display.

## Root cause -- verified 19 Aug 2026
- Booking Course 25043 (General English PM): ended 14 Aug 2026 -- 5 days stale, active = true
- Student Eduardo Roche Diaz (booking 18265): 0 class assignments on this course
- Root cause: no automated deactivation of ended booking courses

## Fix recipe (NOT YET RUN)
Step 1: UPDATE booking_course SET active = false, updated_at = NOW() WHERE id = 25043;
Step 2 verify: SELECT id, name, end_date, active FROM booking_course WHERE id = 25043; -- expect active=false

## Risk
Category: data-hygiene | Reversible: yes | Blast radius: 1 booking course record

## Status
Open. BC25043 5 days stale. Fix NOT RUN.
Last checked: Wed 19 Aug 2026 UTC (188th check)
