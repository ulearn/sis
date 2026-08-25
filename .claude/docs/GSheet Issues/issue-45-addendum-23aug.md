# Issue 45 addendum 23 Aug 2026 (465th check)

Sheet row 47 | Reporter: AC | Area: Renewal students / Booking Courses

## Current data (23 Aug 2026 UTC)
Stale active Booking Courses (end_date < now): 24,515 unchanged from 464th check (22 Aug).
Oldest entries: end_date = 1899-12-31 (migration artefacts from Fidelo import).

## Fix recipe (NOT YET RUN)
Preview count:
  SELECT COUNT(*) FROM booking_courses WHERE active=true AND end_date < NOW();

Deactivate:
  UPDATE booking_courses SET active=false WHERE active=true AND end_date < NOW();

Expected: 24,515 rows. Risk: reversible.

## Risk / category
bookings / data-hygiene | reversible | blast radius: 24,515 rows, all already ended

## Status
Fix NOT RUN. 465th check. Last checked: 2026-08-23 UTC.