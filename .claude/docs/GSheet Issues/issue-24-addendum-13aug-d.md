# Issue 24 — Alberto Squillace — BC 24686 0 class assignments (77th check Thu 13 Aug 2026 UTC)

No data change since 76th check. 24 calendar days since course start. 36 days remaining.

## Evidence
- BC 24686: bookingId=1611, active=true, startDate=2026-07-20, endDate=2026-09-18, classAssignments=0
- SCAs for BC 24686: none

## Fix (NOT YET RUN)
Determine correct AM class for Alberto (via admin UI). Then:
INSERT INTO student_class_assignment (booking_course_id, class_id, week_start, week_end, created_at, updated_at)
VALUES (24686, :class_id, '2026-07-20', '2026-09-18', NOW(), NOW());

Risk: Bookings/Attendance, reversible, 1 student 1 BC, attendance backfill needed for ~19 school days
Last checked: Thu 13 Aug 2026 UTC (77th check)