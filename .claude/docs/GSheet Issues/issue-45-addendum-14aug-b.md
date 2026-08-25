Issue 45 - Stale Booking Courses (92nd check, 14 Aug 2026)

Reporter: AC | Area: Renewal students | Sheet row: 47

SYMPTOM: Returning students not appearing on arrivals list due to stale (active=true but past endDate) Booking Courses.

ROOT CAUSE (DB evidence 14 Aug 2026 ~21:00 UTC):
Active Booking Courses with endDate < 2026-08-14: 24,479 (unchanged)
Live Booking Courses with endDate >= 2026-08-14: 286 (was 285 - one new live BC)

FIX RECIPE (NOT YET RUN):

Stage 1 - Deactivate all stale BCs with no class assignments (safe, bulk):
SQL: UPDATE booking_course SET active = false
       WHERE active = true
       AND end_date < NOW()
       AND id NOT IN (SELECT DISTINCT booking_course_id FROM student_class_assignment WHERE booking_course_id IS NOT NULL);

Stage 2 - Deactivate stale BCs with only past SCAs:
SQL: UPDATE booking_course SET active = false
       WHERE active = true
       AND end_date < NOW()
       AND id IN (SELECT DISTINCT booking_course_id FROM student_class_assignment
                   WHERE booking_course_id IS NOT NULL
                   GROUP BY booking_course_id
                   HAVING MAX(week_end) < NOW());

Stage 3 - Review remaining stale BCs with active SCAs individually before deactivating.

RISK: Data hygiene - large blast radius (24,479 records) but reversible (set active=true). Run in tx, rollback if unexpected.

STATUS: Count unchanged. One new live BC (286 vs 285). Fix NOT RUN.
Last checked: 2026-08-14 ~21:00 UTC