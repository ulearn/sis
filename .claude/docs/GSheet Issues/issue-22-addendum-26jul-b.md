# Issue 22 — Edite Nunes / Edith (student 1015) — Penultimate Window Tomorrow

Reporter: AC | Area: Booking / Class | Sheet row: 23

## Symptom
BC24991 (General English AM, Jul 13-Aug 7) has zero class assignments.

## Root cause (verified Sun 26 Jul 2026 UTC — run 107)
- BC24991 (General English AM, Jul 13-Aug 7): active = true, 0 SCAs — UNCHANGED
- BCs 24933 + 24934 (both ended Jul 10 2026): both still active = true — 17 days stale
- Booking 18214: CONFIRMED, EUR 608 fully paid
- 10 school days missed (Jul 14-25)
- Mon 27 Jul = penultimate window (tomorrow)
- 9 school days remain: Jul 27-31 = 5; Aug 4-7 = 4; Aug 3 = Bank Holiday

## Fix recipe (NOT YET RUN)
1. SIS admin -> Classes -> week beginning Mon 27 Jul -> General English AM -> assign student 1015 (BC24991)
2. Deactivate stale booking courses: UPDATE booking_course SET active = false WHERE id IN (24933, 24934);

## Risk
Bookings / class admin. PENULTIMATE WINDOW is Mon 27 Jul. Course ends Aug 7. Reversible. Single student.

## Status
UNRESOLVED — Penultimate window Mon 27 Jul (TOMORROW). Real last window: Aug 4 (Aug 3 = Bank Holiday).

Last checked: Sun 26 Jul 2026 UTC (run 107)