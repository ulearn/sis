39th check Tue 25 Aug 2026 UTC
11 booking courses still active and stale.
BC 1488 ended 19 Sep 2025 = 341d stale, 0 SCAs
BC 1482/1485/1489/1602 ended Dec 2025 = 249d stale, 0 SCAs
BC 1483/1486/1490 ended Feb 2026 = 193d stale, 0 SCAs
BC 1484 ended 5 Jun 2026 = 81d stale, 1 SCA
BC 1487 ended 5 Jun 2026 = 81d stale, 2 SCAs
BC 1603 ended 5 Jun 2026 = 81d stale, 2 SCAs
Fix NOT RUN
Fix step 1: UPDATE booking_courses SET active=false WHERE id IN (1482,1483,1485,1486,1488,1489,1490,1602);
Fix step 2: SELECT id,week_start,week_end FROM student_class_assignments WHERE booking_course_id IN (1484,1487,1603); then deactivate.
Last checked: 2026-08-25 UTC