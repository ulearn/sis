# Issue 12 Addendum 13 Aug (c)

Sheet row 13 | Check 169th | 249th global run ~18:xx UTC

No change since 168th check (17:03 UTC today).

- SCA 288: bookingCourseId=24697 (ended Jul 31), classId=12, weekEnd=2026-12-18
- BC 24697 (Academic Year Morning): endDate=2026-07-31, active=true, 1 class assignment (anomaly)
- BC 25035 (General English AY AM Plus): startDate=2026-08-03, endDate=2026-12-18, active=true, 0 class assignments
- ~10 school days attendance unrecorded on BC 25035 since 3 Aug

Fix (NOT YET RUN):
  UPDATE StudentClassAssignment SET booking_course_id=25035 WHERE id=288;
  UPDATE BookingCourse SET active=false WHERE id=24697;

Status: Open. Fix NOT RUN.
Last checked: 2026-08-13 ~18:xx UTC
