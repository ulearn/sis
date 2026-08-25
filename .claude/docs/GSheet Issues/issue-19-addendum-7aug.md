# Issue 19 — Stale Booking Courses 89 + 90 (addendum 7 Aug 2026)
Reporter: (legacy) | Area: Bookings / Class | Sheet row: 20

## Symptom
Maï Lan Chu not appearing in class to-be-assigned list.

## Root cause
5th check (Fri 7 Aug 2026 UTC) — unchanged from 4th check (Thu 6 Aug).

- Booking course 89 (Morning IELTS, booking 83, ended 22 May 2026): active = true — 77 days stale
- Booking course 90 (Private Lessons, booking 83, ended 22 May 2026): active = true — 77 days stale
- Booking 83: student 77 (Mai Lan Chu), CONFIRMED, confirmed = true, fully paid EUR 2,362.80

## Fix recipe (NOT YET RUN)
Run in SIS psql:
UPDATE booking_course SET active = false WHERE id IN (89, 90);

## Risk / category
data-hygiene. Reversible. Blast radius: 1 student, cosmetic.

## Status
Open — 77 days stale. Fix NOT RUN.

## Last checked (UTC)
Fri 7 Aug 2026
