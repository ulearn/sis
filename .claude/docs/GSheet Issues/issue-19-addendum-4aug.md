# Issue 19 — Stale Booking Courses 89 + 90 (addendum 4 Aug 2026)
Reporter: (legacy) | Area: Bookings | Sheet row: 20

## Symptom
Booking courses 89 and 90 still active long after course end.

## Root cause
2nd check (Tue 4 Aug 2026 UTC) — unchanged.

- Booking course 89 (Morning IELTS, booking 83, ended 22 May 2026): active = true — 74 days stale
- Booking course 90 (Private Lessons, booking 83, ended 22 May 2026): active = true — 74 days stale
- Booking 83: student 77, CONFIRMED, confirmed = true, fully paid EUR 2629.80
## Fix recipe (NOT YET RUN)
Run in SIS psql:
  UPDATE booking_course SET active = false WHERE id IN (89, 90);
## Risk / category
data-hygiene. Reversible. Blast radius: 1 student. Cosmetic only.
## Status
Open — 74 days stale. Fix NOT RUN.
## Last checked (UTC)
Tue 4 Aug 2026