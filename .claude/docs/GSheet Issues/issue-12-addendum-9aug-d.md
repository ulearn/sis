Issue 12: Rakan Alghamdi - SCA 288 Mislinked, BC 25035 Unassigned
Reporter: Staff | Area: Booking/Accomm | Sheet row: 13 | 134th check Sun 9 Aug 2026 UTC

SYMPTOM
Students with accomm stay Mon-Wed getting nights cut off. Rakan Alghamdi (student 14444) needs SCA fix.

ROOT CAUSE - 134th check UNCHANGED from 133rd
BC 24697 (Academic Year Morning, ended 2026-07-31): active=true (9d stale)
SCA 288 on BC 24697: classId=12, weekStart=2026-07-06, weekEnd=2026-12-18 - extends 140 days past BC end
BC 25035 (General English Academic Year AM Plus, 2026-08-03 to 2026-12-18): active=true, 0 SCAs
Classes restart Mon 10 Aug 09:00. Rakan has no class for week starting tomorrow.

FIX RECIPE - NOT YET RUN
Step 1 - Relink SCA 288 to BC 25035:
UPDATE "StudentClassAssignment" SET "bookingCourseId"=25035, "weekStart"='2026-08-10', "weekEnd"='2026-12-18' WHERE id=288;

Step 2 - Deactivate BC 24697:
UPDATE "BookingCourse" SET active=false WHERE id=24697;

Step 3 - Verify:
SELECT sca.id, sca."bookingCourseId", sca."classId", sca."weekStart", bc.active
FROM "StudentClassAssignment" sca JOIN "BookingCourse" bc ON bc.id=sca."bookingCourseId"
WHERE sca.id=288;
Expected: bookingCourseId=25035, weekStart=2026-08-10, bc.active=true.

RISK: bookings/class assignment. Reversible. Blast radius: Rakan only (student 14444).

STATUS: OPEN - CRITICAL. Fix before Mon 10 Aug 09:00. 134th check Sun 9 Aug 2026 UTC. Unchanged.
Last checked: 2026-08-09 UTC