Issue 24 - Alberto Squillace BC 24686 0 SCAs - 73rd check Thu 13 Aug 2026 UTC

ROOT CAUSE: BC 24686 (Morning General, Jul 20 - Sep 18) has 0 SCAs since start.
24 calendar days, ~18-19 school days unrecorded. Course ends Sep 18 (36d remaining).
- BC 24686: startDate=2026-07-20, endDate=2026-09-18, active=true, SCAs=0
- Booking 1611: CONFIRMED, EUR 1280.12 paid, EUR 0 open

FIX RECIPE (NOT YET RUN):
1. Identify correct AM class_id for Alberto in SIS admin
2. INSERT INTO student_class_assignment (booking_course_id, class_id, week_start, week_end, created_at, updated_at) VALUES (24686, CLASS_ID, 2026-07-20, 2026-09-18, NOW(), NOW());
3. Verify: SELECT * FROM student_class_assignment WHERE booking_course_id=24686; Expected: 1 row

RISK: bookings/attendance | Reversible: yes | Blast: 1 student; backfill Jul 20-Aug 13 may be needed
STATUS: OPEN. 73rd check. 0 SCAs, 18-19 school days lost. Fix NOT RUN.