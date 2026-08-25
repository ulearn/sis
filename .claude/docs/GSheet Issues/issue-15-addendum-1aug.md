ISSUE 15 — Saikhantes Shagdarsuren: SCA needed + stale BC
=========================================================

Area: Booking/Class  Row: 16  Checked: 2026-08-01 UTC (5th hrly)

SYMPTOM
-------
Student on holiday until Aug 24. Last SCA expired Jul 3. Stale BC1982 (ended Dec 2025) still active.

ROOT CAUSE / DB STATE (confirmed 2026-08-01 UTC)
------------------------------------------------
- Student 1001 (Saikhantes Shagdarsuren): visa_status=null.
- Booking 18151 (confirmed=true):
    BC24925 (Academic Year Afternoon, Mar 9–Oct 2 2026): active=true — CURRENT COURSE.
    HOL2500: Jul 20–Aug 21 — student RETURNS Mon 24 Aug 2026.
- Booking 1724 (confirmed=true):
    BC1982 (Academic Year Morning, Jun 30–Dec 19 2025): active=true — STALE 224 days.
- SCA255: classId=11, bcId=24925, weekStart=Jan 12, weekEnd=Jul 3. Last SCA, expired 29 days ago.
- Gap Jul 6–17: 2 teaching weeks with no SCA before holiday. Confirm with Paul if attended.

FIX RECIPE (NOT YET RUN)
------------------------

Step 1 — Create SCA for return Mon 24 Aug (NOT YET RUN — run on or just before Aug 24):
  INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end, created_at)
  VALUES (1001, 24925, 11, '2026-08-24', '2026-10-02', NOW());
  -- class_id=11 from SCA255; confirm with Paul before running
  -- week_end = BC24925 end date 2026-10-02

Step 2 — Handle Jul 6–17 gap (optional — confirm with Paul first):
  INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end, created_at)
  VALUES (1001, 24925, 11, '2026-07-06', '2026-07-17', NOW());

Step 3 — Deactivate stale BC1982 (NOT YET RUN):
  UPDATE booking_course SET active = false WHERE id = 1982;
  -- Ended 2025-12-19 (224 days ago). Safe to deactivate.

Step 4 — Verify:
  SELECT id, name, start_date, end_date, active FROM booking_course bc
  JOIN booking b ON bc.booking_id=b.id WHERE b.student_id = 1001;
  SELECT id, class_id, booking_course_id, week_start, week_end
  FROM student_class_assignments WHERE student_id = 1001 ORDER BY id;

RISK
----
Category: bookings/class assignments/data-hygiene. Reversible: yes. Blast radius: 1 student.
TIMING: SCA step should run on Mon 24 Aug when student returns.

STATUS: OPEN — SCA needed Mon 24 Aug 2026 (23 days away)
Last checked: 2026-08-01 UTC