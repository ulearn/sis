Issue 38 - Eduardo Roche Diaz (COURSE ENDED TODAY - attendance permanently lost)
Reporter: various; Area: Holidays, Bookings; Sheet row: 40

Symptom
Eduardo Roche Diaz (booking 18265, BC 25043) never assigned to a class. Course end date = 2026-08-14 (TODAY, Friday 14 Aug). Course has ended with 0 class assignments.

Root cause (verified 14 Aug 2026 UTC)
BC 25043 (General English PM): end 2026-08-14, active = true, classAssignments = 0.
Eduardo level B2 - appropriate class = id 6 (B2&C1 PM, 13:45-17:00).
BK 18265: CONFIRMED, confirmed = true, amountPaid = EUR 126.
School days lost Mon 10 - Fri 14 Aug: 5 school days. All permanently unrecordable once BC deactivated.

Fix recipe (NOT YET RUN)
1. Create SCA retroactively:
   INSERT INTO student_class_assignments
   (class_id, booking_course_id, week_start, week_end, created_at, updated_at)
   VALUES (6, 25043, '2026-08-10', '2026-08-14', NOW(), NOW());

2. Deactivate BC 25043:
   UPDATE "BookingCourse" SET active = false, updated_at = NOW() WHERE id = 25043;

3. Add attendance records if Eduardo was present Mon-Fri 10-14 Aug (verify with Paul/teacher).

Risk / category
bookings / attendance; reversible; blast radius: 1 student.
Without SCA, no completion certificate possible.

Status: OPEN - course ended today without assignment. 5 days lost. Fix NOT RUN.
Last checked: 2026-08-14 UTC (159th check)