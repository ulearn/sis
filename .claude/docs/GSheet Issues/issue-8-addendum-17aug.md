# Issue 8 -- Stale Booking Courses Diego/Pedro/ILEP (31st check)

Reporter: NM | Area: Doc Gen/Certs | Sheet row: 9 | Last checked: 2026-08-17 UTC

## Symptom
Cannot generate completion certificates for several ILEP students (Diego Alves, Pedro De P).

## Root cause (no change)
6 booking courses still active past end date:
- BC 1482 (Academic Year Afternoon): ended 2025-12-19 -- 241 days stale, 0 class assignments
- BC 1483 (Academic Year Afternoon): ended 2026-02-13 -- 185 days stale, 0 class assignments
- BC 1485 (Academic Year Afternoon): ended 2025-12-19 -- 241 days stale, 0 class assignments
- BC 1486 (Academic Year Afternoon): ended 2026-02-13 -- 185 days stale, 0 class assignments
- BC 1487 (Academic Year Afternoon): ended 2026-06-05 -- 73 days stale, 2 class assignments (verify)
- BC 1488 (Afternoon General): ended 2025-09-19 -- 332 days stale, 0 class assignments

## Fix recipe (NOT YET RUN)
1. Deactivate BCs 1482, 1483, 1485, 1486, 1488 (0 class assignments -- safe):
   UPDATE booking_courses SET active = false WHERE id IN (1482,1483,1485,1486,1488);
2. Verify BC 1487 class assignments are within the course period (historical) before deactivating:
   SELECT id, week_start, week_end FROM student_class_assignments WHERE booking_course_id = 1487;
   If all historical: UPDATE booking_courses SET active = false WHERE id = 1487;

## Risk
Data hygiene. Medium risk on BC 1487 (has 2 class assignments -- verify first). Reversible.

## Status
332 days max stale. No change. Fix pending Neil approval.
Last checked: 2026-08-17 UTC (31st check)