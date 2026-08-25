Issue 12 - Rakan Alghamdi SCA on Wrong BC - 168th check Thu 13 Aug 2026 UTC

ROOT CAUSE: SCA 288 on BC 24697 (ended 31 Jul) not BC 25035 (Aug 3 - Dec 18). 9-10 school days lost.
- SCA 288: bookingCourseId=24697, weekEnd=2026-12-18
- BC 25035: 0 SCAs
- BC 24697: still active=true (anomaly)

FIX RECIPE (NOT YET RUN):
1. UPDATE student_class_assignment SET booking_course_id=25035, updated_at=NOW() WHERE id=288;
2. UPDATE booking_course SET active=false, updated_at=NOW() WHERE id=24697;
3. Verify: SELECT booking_course_id FROM student_class_assignment WHERE id=288; Expected: 25035

RISK: bookings/attendance | Reversible: yes | Blast: 1 student
STATUS: OPEN. 168th check. SCA 288 still on BC 24697. Fix NOT RUN.