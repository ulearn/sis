# Issue 39 addendum 29 Jul 2026 run B

CRITICAL -- COURSE ENDS FRI 31 JUL (2 days). Student 14443 (Xuezhen Huang), BC 24609 (Morning General 13 Jul-31 Jul 2026), 0 class assignments.
17 school days with no SCA. Thu 30 + Fri 31 Jul are last 2 school days.

Fix (NOT YET RUN -- ASSIGN TODAY):
1. Find class: SELECT c.id,c.name FROM classes c JOIN class_occurrences co ON co.class_id=c.id WHERE co.date="2026-07-29" AND c.name ILIKE "%morning general%";
2. INSERT INTO student_class_assignments (booking_course_id,student_id,class_id,week_start,week_end) VALUES (24609,14443,<class_id>,"2026-07-27","2026-07-31");

Window closes permanently after Thu 30 Jul 2026.
Status: Open -- CRITICAL -- 150th check. Fix NOT RUN. 2026-07-29 UTC
