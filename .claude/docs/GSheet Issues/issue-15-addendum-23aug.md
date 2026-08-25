Issue 15 — Saikhantes Shagdarsuren

Reporter: AC | Area: booking/class | Sheet row 16

Symptom
--------
Student due back from holiday Mon 24 Aug 2026. SCA expired before holiday started; no new SCA within BC 24925.

Root Cause (480th check, Sun 23 Aug 2026 UTC)
--------------------------------------------
- Student 1001 (Saikhantes Shagdarsuren)
- SCA 255: class 11 (B1 PM), weekStart 2026-01-12, weekEnd 2026-07-03 -- expired BEFORE holiday started
- Holiday 2500: booking 18151, Jul 20 to Aug 21 2026 (Fri) -- student back Mon 24 Aug 2026 = TOMORROW
- No new SCA within BC 24925 for Aug 24 to Oct 2 2026
- BC 24925 (Academic Year Afternoon, booking 18151): active, ends 2026-10-02
- Gap: SCA weekEnd Jul 3, holiday started Jul 20 -- 17-day unexplained gap before holiday

Fix Recipe (NOT YET RUN)
------------------------

Verify no post-holiday SCA:
  SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE student_id = 1001 ORDER BY id DESC;

Create new SCA for post-holiday return:
  INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end, created_at)
  VALUES (1001, 11, 24925, '2026-08-24', '2026-10-02', NOW());
  -- class 11 = B1 PM -- confirm with AC/Paul still correct

Backfill Jul 4-19 gap (optional):
  UPDATE student_class_assignments SET week_end = '2026-07-17' WHERE id = 255;

Blast radius: Saikhantes only.
URGENCY: HIGH -- student returns tomorrow; no SCA = missing from attendance sheets.

Status: OPEN -- Fix NOT RUN
Last checked: 2026-08-23 UTC (480th hourly run)