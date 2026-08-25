Issue 24 - Alberto Squillace (Addendum 26 Jul 2026)

Reporter: AC | Area: Booking | Sheet row: 25

Symptom: Two Morning General courses on booking 1611. BC 24686 (Jul 20-Sep 18) has no class assignment and fee = null.

Root cause (fresh data 26 Jul 2026 UTC):
- Booking course 24686 (Morning General, Jul 20-Sep 18 2026): active = true, fee = null, 0 class assignments
- Booking course 1797 (Morning General, Apr 6-Jun 26 2026): active = true, 30 days stale (ended Jun 26)
- Week 1 (Jul 20-25): 5 school days missed, irrecoverable
- WEEK 2 STARTS TOMORROW Mon 27 Jul 2026, last window before further daily losses
- Booking 1611: status = CONFIRMED, student = Alberto Squillace

Fix recipe (NOT YET RUN):
Step 1: Confirm fee for BC 24686 with KC/Diego. Original BC 1797 fee = EUR 1836 (~9 weeks). BC 24686 same rate.
Step 2: UPDATE booking_courses SET fee = <amount> WHERE id = 24686;
Step 3: Assign BC 24686 to Morning General class wb Mon 27 Jul 2026 via SIS admin.
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end, student_id)
  VALUES (24686, 12, 2026-07-27, 2026-09-18, 1052);
Step 4: UPDATE booking_courses SET active = false WHERE id = 1797; -- deactivate stale BC 1797

Risk/Category: bookings / attendance, reversible
URGENCY: CRITICAL - week 2 starts Mon 27 Jul. Each missed day permanently unrecorded.

Status: OPEN - Fix NOT RUN. Week 1 (5 days) permanently missed.
Last checked: 26 Jul 2026 UTC (108th hourly run)
Note added Sun 26 Jul 2026: class_id confirmed = 12 (MORNING session, 09:00-12:20, Mon-Fri).
Alberto was previously assigned to class 12 for booking course 1797 (Apr 6-Jun 26 2026, SCA 229).
Student ID = 1052 (Alberto Squillace, B1 level). Booking ID = 1611.
Full INSERT (NOT YET RUN):
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end, created_at)
  VALUES (24686, 1052, 12, '2026-07-27', '2026-09-18', NOW());
URGENCY: Week 2 starts TODAY Mon 27 Jul 2026 -- assign NOW or lose today.
