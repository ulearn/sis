# Issue 39 — Xuezhen Huang (student 14443) — FINAL WINDOW Mon 27 Jul

Reporter: ST | Area: Booking / Accomm | Sheet row: 41

## Symptom
BC24609 (Morning General, Jul 13-Jul 31) has zero class assignments.

## Root cause (verified Sun 26 Jul 2026 UTC — run 107)
- BC24609: active = true, 0 student class assignments — UNCHANGED
- 10 school days missed (Jul 14-25, weeks 1 and 2)
- Mon 27 Jul 2026 = FINAL WINDOW — tomorrow
- Course ends Jul 31: 5 school days remain (Jul 27-31)
- Accommodation 11357 (Jul 12-Aug 2, bed 180): active = true — correct
- Booking 17831: CONFIRMED, fully paid EUR 1,396.90

## Fix recipe (NOT YET RUN)
1. SIS admin -> Classes -> week beginning Mon 27 Jul -> Morning General -> assign student 14443 (BC24609)
2. Confirm student class assignment created for booking course 24609

## Risk
Bookings / class admin. FINAL WINDOW is Mon 27 Jul. Course ends Jul 31. Reversible. Single student.

## Status
UNRESOLVED — FINAL WINDOW Mon 27 Jul 2026. 5 school days left if fixed now.

Last checked: Sun 26 Jul 2026 UTC (run 107)