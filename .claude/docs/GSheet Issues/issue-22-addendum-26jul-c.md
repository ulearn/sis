# Issue 22 — Edite Nunes (Addendum 26 Jul 2026 C) — Penultimate Window Tomorrow

Reporter: AC | Area: Booking / Class | Sheet row: 23

## Root cause (verified Sun 26 Jul 2026 UTC — run 109)
- Booking course 24991 (General English AM, Jul 13–Aug 7 2026): active = true, 0 class assignments — UNCHANGED
- Booking courses 24933 + 24934 (ended Jul 10 2026): both active = true — 17 days stale
- 10 school days missed (Jul 14–25, weeks 1+2) — irrecoverable
- Penultimate window: Mon 27 Jul = tomorrow (5 school days Jul 27–31)
- Final window: week of Aug 4–7 (4 school days; Aug 3 = Bank Holiday)

## Fix recipe (NOT YET RUN)
1. SIS admin → Classes → week beginning Mon 27 Jul → General English AM → assign student (BC 24991).
2. Deactivate stale booking courses:
   UPDATE booking_course SET active = false WHERE id IN (24933, 24934);

## Risk
bookings / class attendance; reversible; CRITICAL — penultimate window tomorrow

## Status
UNRESOLVED — Fix NOT RUN. 10 days lost, 9 remain. Last checked: Sun 26 Jul 2026 UTC (run 109)
