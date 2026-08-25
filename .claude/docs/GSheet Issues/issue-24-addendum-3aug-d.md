Issue 24 - Alberto Squillace (47th check Mon 3 Aug 2026 UTC, 9th today)
Reporter: PG | Area: Booking / Class | Sheet row: 25


ROOT CAUSE (fresh 3 Aug 2026 UTC):
- BC 24686 (Morning General, bk1611, Jul 20-Sep 18 2026): active=true, 0 class assignments (confirmed fresh)
- BC 1797 (Morning General, bk1611, Apr 6-Jun 26 2026): active=true - 38 days stale
- SCA 229 on BC 1797: class 12, weekStart Apr 6, weekEnd Apr 26 - on stale BC only
- No holidays recorded in SIS for booking 1611
- Student returns TOMORROW Tue 4 Aug 2026 (today = Aug Bank Holiday)
- Dependency: Issue 38 shunt must run first (BC 24686 startDate remains Aug 3 until shunted)


FIX RECIPE (NOT YET RUN):
1. Deactivate stale BC 1797:
   UPDATE booking_courses SET active = false WHERE id = 1797;
2. Create class assignment on BC 24686 (class 12, week starting Tue 4 Aug):
   INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
   SELECT 24686, b.student_id, 12, '2026-08-04', '2026-09-18' FROM bookings b WHERE b.id = 1611;
   (Verify class_id 12 = Morning General before running)


RISK: bookings/class | Reversible: yes | Blast: 1 student (Alberto Squillace)
STATUS: 47th check Mon 3 Aug 2026 UTC (9th today). Student returns TOMORROW Tue 4 Aug. URGENT. NOT YET RUN.