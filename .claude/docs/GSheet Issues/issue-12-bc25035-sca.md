Issue 12 - Rakan Alghamdi - BC 25035 (0 SCAs) (165th check, 12 Aug 2026)

Sheet row: 13  Reporter: ST  Area: Doc Gen / Booking

Symptom: Booking Course 25035 (General English AM Plus, Aug 3 to Dec 18, 2026) has 0 class assignments.

Evidence (DB confirmed 165th check, 12 Aug 2026):
- BC 25035: active=true, start 2026-08-03, end 2026-12-18, classAssignments=0
- Student: Rakan Alghamdi (14444), booking 17915
- SCA 288 is on old ended BC 24697 (class 12, week_start 2026-07-06, week_end 2026-12-18) - misrouted
- 9+ school days elapsed since Aug 3 with no attendance on correct BC

Fix Recipe - NOT YET RUN:
  Option A (preferred): Reassign SCA 288 from BC 24697 to BC 25035:
    UPDATE student_class_assignments SET booking_course_id=25035 WHERE id=288;

  Option B: Create new SCA on BC 25035 via SIS admin UI:
    INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
    VALUES (25035, 14444, 12, 2026-08-03, 2026-12-18);
    then: DELETE FROM student_class_assignments WHERE id=288;

Risk: bookings/attendance. Reversible. Blast radius: 1 student (ongoing AY course).
Status: Fix NOT RUN. 165 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC (165th check)