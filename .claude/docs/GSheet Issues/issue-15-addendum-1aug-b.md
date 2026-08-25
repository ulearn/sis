ISSUE 15 — Saikhantes Shagdarsuren: class assignment needed + stale booking course
===================================================================================

Area: Booking/Class  Row: 16  Checked: 2026-08-01 UTC (6th hrly, 5th of day)

ROOT CAUSE (5th check of day — UNCHANGED)
- Student 1001 (Saikhantes Shagdarsuren): visa_status=null.
- Holiday HOL2500: Jul 20-Aug 21 2026 — returns Mon 24 Aug 2026 (23 days away).
- Booking course 24925 (Academic Year Afternoon, Mar 9-Oct 2 2026): active=true — current course.
- Booking course 1982 (Academic Year Morning, Jun 30-Dec 19 2025): active=true — 224 days stale.
- Last class assignment: SCA255 (class 11, booking course 24925, week end Jul 3 2026) — 29 days expired.
- Gap Jul 6-17: 2 teaching weeks before holiday with no class assignment. Confirm with Paul.

FIX RECIPE (NOT YET RUN)

Step 1 - Create class assignment for return Mon 24 Aug (NOT YET RUN — run on/before Aug 24):
  INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_end, created_at)
  VALUES (1001, 24925, 11, '2026-10-02', NOW());
  -- class_id=11 from SCA255; confirm with Paul before running.

Step 2 - Handle Jul 6-17 gap (optional — confirm with Paul first):
  INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_end, created_at)
  VALUES (1001, 24925, 11, '2026-07-17', NOW());

Step 3 - Deactivate stale booking course 1982 (NOT YET RUN):
  UPDATE booking_courses SET active=false WHERE id=1982;

RISK: bookings/class assignments/data-hygiene, reversible, 1 student.
TIMING: Class assignment step should run on or just before Mon 24 Aug.
STATUS: OPEN — class assignment needed Mon 24 Aug 2026 (23 days away).
Last checked: 2026-08-01 UTC (6th check, 5th of day)
