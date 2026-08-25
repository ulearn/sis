# Issue 24 - Alberto Squillace SCA CORRECTED (50th check Mon 3 Aug 2026 UTC, 12th today)
Reporter: PG | Area: Booking | Sheet row: 25

Root Cause (fresh + correction):
- Student 1052 (Alberto Squillace), booking_id=1611 -- CORRECTION: previous H said student 1611, that is booking_id not student_id
- BC 24686 (Morning General, bk1611, Jul 20-Sep 18 2026): active=true, 0 SCAs -- 14 days since start
- BC 1797 (Morning General, bk1611, Apr 6-Jun 26 2026): active=true, ended 38 days ago (stale), 1 SCA (class 12, Apr 6-Apr 26)

Fix Recipe (NOT YET RUN) -- CORRECTED:
Step 1: UPDATE booking_courses SET active=false,updated_at=NOW() WHERE id=1797;
Step 2: INSERT INTO student_class_assignments (booking_course_id,student_id,class_id,week_start,week_end) VALUES (24686,1052,12,'2026-08-04','2026-09-18'); -- verify class 12=Morning General
Step 3: SELECT id,class_id,week_start FROM student_class_assignments WHERE booking_course_id=24686;
Step 4: SELECT active FROM booking_courses WHERE id=1797; -- expect false

Risk: bookings/class | Reversible: yes | Blast: student 1052
Status: 50th check. BC24686 0 SCAs 14d. BC1797 stale. CORRECTED student_id=1052. Fix NOT RUN. Last checked: 2026-08-03 UTC
