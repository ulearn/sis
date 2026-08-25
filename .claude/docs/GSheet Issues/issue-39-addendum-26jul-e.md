# Issue 39 — Xuezhen Huang (Addendum 26 Jul 2026 E) — FINAL WINDOW TOMORROW

Reporter: KC | Area: Booking / Accomm | Sheet row: 41

## Root cause (verified Sun 26 Jul 2026 UTC — run 110)
- Booking course 24609 (Morning General, Jul 13-31 2026): active = true, fee = 570, 0 class assignments — UNCHANGED from run 109
- Student 14443 Xuezhen Huang, booking 17831: CONFIRMED, fully paid EUR 1,828.80
- 10 school days missed (Jul 14-25, weeks 1+2) — irrecoverable
- FINAL WINDOW: Mon 27 Jul = tomorrow (last school week Jul 27-31)
- 5 school days remain; if not assigned Monday all 15 days are permanently lost

## Fix recipe (NOT YET RUN)
Step 1: SIS admin -> Classes -> week beginning Mon 27 Jul -> Morning General -> assign student 14443 (BC 24609).
SQL if needed:
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES (24609, 14443, <morning_general_class_id>, '2026-07-27', '2026-07-31');

## Risk
bookings / attendance; reversible; CRITICAL — last window tomorrow Mon 27 Jul

## Status
UNRESOLVED — Fix NOT RUN. 10 days lost, 5 remain. Last checked: Sun 26 Jul 2026 UTC (run 110)