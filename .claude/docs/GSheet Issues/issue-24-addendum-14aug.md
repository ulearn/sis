Issue 24 - Alberto Squillace (BC 24686 - 0 class assignments, course ongoing)
Reporter: pg; Area: booking; Sheet row: 25

Symptom
Migration problem - two courses in SIS (12-week ending Jun 26 and 9-week starting Jul 27). Student has no class assignment on second course.

Root cause (verified 14 Aug 2026 UTC)
BC 24686 (Morning General): start 2026-07-20, end 2026-09-18, active = true, 0 class assignments.
Course active 25 calendar days (~20 school days lost since Jul 20).
Course ends 2026-09-18 - 35 days remaining; still actionable.
Alberto level: Morning General - needs assignment to AM General class.

Fix recipe (NOT YET RUN)
1. Assign BC 24686 to appropriate AM General class via SIS admin UI.
   Or via DB (replace CLASS_ID with correct Morning General class id):
   INSERT INTO student_class_assignments (class_id, booking_course_id, week_start, week_end, created_at, updated_at)
   VALUES (CLASS_ID, 24686, '2026-08-14', '2026-09-18', NOW(), NOW());

2. Optionally add historical SCA for Jul 20 - Aug 13 if attendance needs backfill (confirm with teacher).

Risk / category
bookings / attendance; reversible; blast radius: 1 student.
~20 school days unrecorded; 35 days remaining before course ends.

Status: OPEN - 0 class assignments, ~20 school days lost. Course ends Sep 18. Fix NOT RUN.
Last checked: 2026-08-14 UTC (78th check)