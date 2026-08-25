# Issue 15 - Saikhantes Shagdarsuren class assignment + stale BC
Reporter: Staff | Area: Booking/Class | Sheet row: 16

Symptom: Course dates and holidays make no sense. Not appearing correctly in class assignment flow.

Root cause (15th check, 7th today - Sun 2 Aug 2026 UTC):
- Student 1001 (Saikhantes Shagdarsuren), booking 18151 (CONFIRMED, confirmed = true)
- Holiday (booking 18151): Jul 20-Aug 21 2026 - returns Mon Aug 24 (22 days remaining)
- Last SCA: id 255, class 11, weekEnd Jul 3 2026 - 30 days since last assignment
- Booking course 24925 (Academic Year Afternoon, Mar 9-Oct 2 2026): active, 1 SCA total (id 255), no assignments after Jul 3
- Booking course 1982 (Academic Year Morning, Jun 30-Dec 19 2025): still active - 226 days stale (ended Dec 19 2025)

Fix recipe (NOT YET RUN):

Step 1 - Deactivate stale BC 1982 (ended Dec 19 2025):
UPDATE booking_courses SET active = false WHERE id = 1982;

Step 2 - Create class assignment for Aug 24 return (on BC 24925):
INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
VALUES (24925, 1001, 11, '2026-08-24', '2026-08-28');
Continue weekly from Aug 24 through Oct 2 (BC 24925 end date).

Step 3 - Verify:
SELECT id, start_date, end_date FROM booking_holidays WHERE booking_id = 18151;
SELECT id, active, start_date, end_date FROM booking_courses WHERE id IN (24925, 1982);

Risk: bookings, data-hygiene. BC 1982 deactivation reversible (ended 226d ago). SCA reversible.
Window: SCA should be created before Aug 24 (22 days from now).
Status: OPEN. Fix NOT RUN. Returns Mon Aug 24. Last checked: Sun 2 Aug 2026 UTC (15th check, 7th today)