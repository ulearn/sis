# Issue 39 — Xuezhen Huang (student 14443) — FINAL WINDOW TOMORROW

Reporter: ST | Area: Booking / Accomm | Sheet row: 41

## Symptom
BC 24609 (Morning General, Jul 13-Jul 31) has zero class assignments. Accommodation resolved.

## Root cause (verified Sun 26 Jul 2026 UTC)
- BC24609 active=true, 0 SCAs (confirmed fresh query)
- 10 school days missed (Jul 14-25, weeks 1 and 2)
- Mon 27 Jul 2026 = FINAL WINDOW — tomorrow
- Course ends Jul 31: 5 school days remain (Jul 27-31)
- Accommodation 11357 (Jul 12-Aug 2, bed 180): active=true, correct
- BK17831: CONFIRMED, fully paid EUR 1,396.90

## Fix recipe (NOT YET RUN)
1. SIS admin Classes -> wb Mon 27 Jul -> Morning General -> assign student 14443 (BC24609)
2. Verify classAssignment record for BC24609 week >= Jul 27

## Risk
Bookings. FINAL WINDOW tomorrow. Reversible. Single student.

## Status
UNRESOLVED — FINAL WINDOW Mon 27 Jul 2026 (TOMORROW)

Last checked: Sun 26 Jul 2026 UTC (106th hourly run)