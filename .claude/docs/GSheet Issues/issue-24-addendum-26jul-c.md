# Issue 24 — Alberto Squillace (Addendum 26 Jul 2026 C) — Week 2 Starts Tomorrow

Reporter: AC | Area: Booking | Sheet row: 25

## Root cause (verified Sun 26 Jul 2026 UTC — run 110)
- Booking course 24686 (Morning General, Jul 20-Sep 18 2026): active = true, fee = null, 0 class assignments — UNCHANGED from run 109
- Booking course 1797 (Morning General, Apr 6-Jun 26 2026): active = true — 30 days stale
- Booking 1611: CONFIRMED, fully paid EUR 1,280.12
- Student 1052 Alberto Squillace; previously class 12 (Morning 09:00-12:20) for BC1797 (SCA 229)
- Week 1 (Jul 20-25): 5 school days missed — irrecoverable
- Week 2 starts Mon 27 Jul = TOMORROW

## Fix recipe (NOT YET RUN)
Step 1: Confirm fee for BC24686 with Diego/KC (BC1797 rate was EUR 1,836 for ~9 weeks).
Step 2: UPDATE booking_course SET fee = <amount> WHERE id = 24686;
Step 3: Assign BC24686 to class 12 starting Mon 27 Jul:
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES (24686, 1052, 12, '2026-07-27', '2026-09-18');
Step 4: UPDATE booking_course SET active = false WHERE id = 1797;

## Risk
bookings / attendance; reversible; urgent — week 2 starts tomorrow

## Status
UNRESOLVED — Week 2 starts Mon 27 Jul (TOMORROW). 5 days lost. Fix NOT RUN. Last checked: Sun 26 Jul 2026 UTC (run 110)