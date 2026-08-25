# Issue 12 — SCA on wrong Booking Course (170th check Thu 13 Aug 2026 UTC)

No data change since 169th check. SCA 288 still on BC 24697 (ended Jul 31). BC 25035 still 0 class assignments.

## Evidence
- SCA 288: bookingCourseId = 24697, classId = 12, weekEnd = 2026-12-18
- BC 24697: active = true, endDate = 2026-07-31, classAssignments = 1 (anomaly)
- BC 25035: active = true, startDate = 2026-08-03, endDate = 2026-12-18, classAssignments = 0
- Approx 14 school days of attendance unrecorded since BC 25035 started Aug 3

## Fix (NOT YET RUN)
UPDATE student_class_assignment SET booking_course_id = 25035 WHERE id = 288;
UPDATE booking_course SET active = false WHERE id = 24697;

Risk: Bookings/Attendance, reversible, 1 SCA 2 BCs 1 student
Last checked: Thu 13 Aug 2026 UTC (170th check)