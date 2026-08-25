# Issue 12 — Rakan Alghamdi / SCA 288 on Wrong Booking Course (181st check, 17 Aug 2026 UTC)
Reporter: KC | Area: Booking/Class | Sheet row: 13

## Symptom
Student class assignment linked to expired Booking Course instead of active renewal.

## Root cause (evidence)
- SCA 288: bookingCourseId = 24697 (WRONG), classId = 12, weekEnd = 2026-12-18
- Booking Course 24697 (Academic Year Morning): ended 2026-07-31 — 17 days stale, active = true, 1 SCA (SCA 288)
- Booking Course 25035 (General English Academic Year AM Plus): start 2026-08-03, end 2026-12-18, active = true, 0 SCAs
- SCA weekEnd = 2026-12-18 matches BC 25035 end — assignment must move to BC 25035
- BC 25035 has been running 14 days with no class assignment
- Student 14444 (Rakan Alghamdi) may be attending but not properly tracked

## Fix recipe (NOT YET RUN)

Step 1 — Move SCA 288 to BC 25035:
  UPDATE StudentClassAssignment SET bookingCourseId = 25035, updatedAt = NOW() WHERE id = 288;

Step 2 — Deactivate BC 24697 (0 SCAs after step 1):
  UPDATE BookingCourse SET active = false, updatedAt = NOW() WHERE id = 24697;

Step 3 — Verify:
  SELECT id, bookingCourseId, classId FROM StudentClassAssignment WHERE id = 288;
  SELECT id, active FROM BookingCourse WHERE id IN (24697, 25035);

## Risk / Category
Bookings + attendance | Reversible | Blast radius: SCA 288 only (Rakan Alghamdi, student 14444)

## Status
OPEN — fix NOT RUN. BC 24697 now 17 days stale. BC 25035 running 14 days with 0 SCAs.
Last checked: 2026-08-17 UTC (181st check)