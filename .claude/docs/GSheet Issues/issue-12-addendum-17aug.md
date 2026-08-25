Issue 12 - Rakan Alghamdi / SCA 288 on Wrong Booking Course
Reporter: KC | Area: Booking / Class | Sheet row: 13

Symptom: SCA 288 linked to BC 24697 (ended 31 Jul 2026) instead of active successor BC 25035.
BC 24697 is 17 days stale; BC 25035 has 0 SCAs.

Root cause (evidence)
- SCA 288: bookingCourseId=24697 (WRONG), classId=12, weekEnd=2026-12-18
- BC 24697 (Academic Year Morning): active=true, endDate=2026-07-31, 17 days stale, 1 SCA (SCA 288)
- BC 25035 (General English Academic Year AM Plus): active=true, start=2026-08-03, end=2026-12-18, 0 SCAs
- SCA weekEnd=2026-12-18 matches BC 25035 end -- assignment must move to BC 25035

Fix recipe -- NOT YET RUN
  UPDATE StudentClassAssignment SET bookingCourseId=25035 WHERE id=288;
  UPDATE BookingCourse SET active=false WHERE id=24697;
  SELECT id, bookingCourseId, classId FROM StudentClassAssignment WHERE id=288;
  SELECT id, active FROM BookingCourse WHERE id IN (24697, 25035);

Risk: Bookings/class -- reversible. Blast radius: SCA 288 only; Rakan Alghamdi student 14444.
Status: Open -- fix NOT RUN. BC 24697 now 17 days stale.
Last checked: 2026-08-17 UTC (180th check)