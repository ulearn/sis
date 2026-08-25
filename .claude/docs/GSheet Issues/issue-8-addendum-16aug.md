# Issue 8 — Stale Booking Courses (Cert Gen)
Reporter: AC | Area: Doc Gen/Certs | Row 9 | 30th check Sun 16 Aug 2026 UTC — no change

ROOT CAUSE (live data, verified 16 Aug 2026):
- BC 1482 (Academic Year Afternoon): ended 2025-12-19 — 240 days stale, active, 0 class assignments
- BC 1483 (Academic Year Afternoon): ended 2026-02-13 — 184 days stale, active, 0 class assignments
- BC 1485 (Academic Year Afternoon): ended 2025-12-19 — 240 days stale, active, 0 class assignments
- BC 1486 (Academic Year Afternoon): ended 2026-02-13 — 184 days stale, active, 0 class assignments
- BC 1487 (Academic Year Afternoon): ended 2026-06-05 — 72 days stale, active, 2 class assignments (verify historical first)
- BC 1488 (Afternoon General): ended 2025-09-19 — 331 days stale, active, 0 class assignments

FIX RECIPE (NOT YET RUN):
1. Verify BC 1487 class assignments are historical (weekEnd < 2026-06-05):
   SELECT id, week_start, week_end FROM student_class_assignments WHERE booking_course_id = 1487;
2. Deactivate BCs 1482/1483/1485/1486/1488 (0 class assignments — safe):
   UPDATE booking_course SET active = false WHERE id IN (1482,1483,1485,1486,1488);
3. Deactivate BC 1487 (after confirming class assignments are historical):
   UPDATE booking_course SET active = false WHERE id = 1487;

RISK: Data hygiene; reversible (set active=true to undo). No financial/document impact.
STATUS: OPEN — no change. Fix NOT RUN.
Last checked: Sun 16 Aug 2026 UTC (30th check)
