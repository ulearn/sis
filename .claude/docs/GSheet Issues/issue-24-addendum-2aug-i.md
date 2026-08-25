# Issue 24 - Alberto Squillace class assignment + stale BC
Reporter: Staff | Area: Booking | Sheet row: 25

Symptom: Migration issue - bereavement holidays in Fidelo. SIS has second 9-week course (BC 24686) from Jul 20. No class since Apr 26.

Root cause (32nd check, 12th today - Sun 2 Aug 2026 UTC):
- Student (id 1052) resumes Tue Aug 4 (tomorrow, after Aug Bank Holiday)
- Booking course 24686 (Morning General, Jul 20-Sep 18 2026): active, fee = null, 0 class assignments - unchanged
- Booking 1611: CONFIRMED, confirmed = true, fully paid EUR 1,280.12, amount open = EUR 0
- Booking course 1797 (Morning General, Apr 6-Jun 26 2026): still active - 37 days stale (ended Jun 26)
- Last SCA: id 229, class 12, week end Apr 26 2026

Fix recipe (NOT YET RUN):

Step 1 - Set fee on BC 24686 (confirm with accounts first):
UPDATE booking_courses SET fee = <amount> WHERE id = 24686;

Step 2 - Create class assignment for week of Aug 4 on BC 24686:
INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
VALUES (24686, 1052, 12, '2026-08-04', '2026-08-08');
Continue weekly through Sep 18 2026.

Step 3 - Deactivate stale BC 1797 (ended Jun 26 2026):
UPDATE booking_courses SET active = false WHERE id = 1797;

Step 4 - Verify:
SELECT id, name, start_date, end_date, active, fee FROM booking_courses WHERE id IN (24686, 1797);

Risk: bookings, data-hygiene. BC 1797 deactivation reversible (ended 37d ago). Fee: confirm before applying.
Status: OPEN. Fix NOT RUN. Student resumes Tue Aug 4. Last checked: Sun 2 Aug 2026 UTC (32nd check, 12th today)
