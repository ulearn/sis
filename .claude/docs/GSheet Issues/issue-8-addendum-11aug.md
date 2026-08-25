# Issue 8 — Stale Booking Courses Blocking Certificate Generation
Reporter: staff | Area: Doc Gen / Certs | Sheet row 9 | 24th hourly check Tue 11 Aug 2026 UTC

## Symptom
Cannot generate completion certificates for ILEP students (Diego Alves, Pedro De Pauli, Aurora Mad).

## Root cause (live data, 11 Aug 2026)
Six Booking Courses active = true that have ended:
- BC 1482: Academic Year Afternoon, ended 2025-12-19, 235 days stale, 0 SCAs
- BC 1483: Academic Year Afternoon, ended 2026-02-13, 179 days stale, 0 SCAs
- BC 1485: Academic Year Afternoon, ended 2025-12-19, 235 days stale, 0 SCAs
- BC 1486: Academic Year Afternoon, ended 2026-02-13, 179 days stale, 0 SCAs
- BC 1487: Academic Year Afternoon, ended 2026-06-05,  67 days stale, 2 SCAs
- BC 1488: Afternoon General,       ended 2025-09-19, 326 days stale, 0 SCAs

BC 1487 has 2 SCAs — verify student has successor active BC before deactivating.

## Fix recipe — NOT YET RUN

Step 1 — Deactivate BCs with 0 SCAs (safe):
  UPDATE booking_courses SET active = false WHERE id IN (1482, 1483, 1485, 1486, 1488);

Step 2 — Handle BC 1487 (2 SCAs). First check which students:
  SELECT sca.id, s.first_name, s.last_name
  FROM student_class_assignments sca JOIN students s ON sca.student_id = s.id
  WHERE sca.booking_course_id = 1487;
  If students have a successor active BC: UPDATE booking_courses SET active = false WHERE id = 1487;

Step 3 — Re-test cert generation for affected students after deactivation.

## Risk
Category: documents + data-hygiene | Reversible: yes | Blast radius: low

## Status
Unchanged since 10 Aug 2026. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC