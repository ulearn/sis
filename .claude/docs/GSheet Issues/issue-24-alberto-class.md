Issue 24 - Alberto Squillace / BC 24686 No Class Assignment
Reporter: PG | Area: Booking | Sheet row: 25

Symptom: Post-holiday course BC 24686 active since 20 Jul 2026 with 0 SCAs. Old BC 1797 stale 52 days.

Root cause (evidence)
- BC 24686 (Morning General, bk 1611): start=2026-07-20, end=2026-09-18, active=true, 0 SCAs
  28 calendar days elapsed; 32 remaining
- BC 1797 (Morning General): ended 2026-06-26, active=true -- 52 days stale, 1 historical SCA
- Booking 1611: CONFIRMED, fully paid EUR 1280.12, confirmed=true

Fix recipe -- NOT YET RUN
  UPDATE BookingCourse SET active=false WHERE id=1797;
  SELECT sca.classId FROM StudentClassAssignment sca WHERE sca.bookingCourseId=1797 LIMIT 1;
  INSERT INTO StudentClassAssignment (bookingCourseId, classId, weekStart, weekEnd)
    VALUES (24686, CLASS_ID, 2026-07-20, 2026-09-18);
  SELECT id, active FROM BookingCourse WHERE id IN (1797, 24686);
  SELECT id, classId FROM StudentClassAssignment WHERE bookingCourseId=24686;

Info needed: which class? Check historical SCA on BC 1797.
Risk: Bookings/class -- reversible. Blast radius: student 14439 Alberto Squillace.
Status: Open -- fix NOT RUN. 28 calendar days elapsed without class.
Last checked: 2026-08-17 UTC (82nd check)