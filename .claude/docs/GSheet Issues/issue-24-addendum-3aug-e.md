Issue 24 -- Alberto Squillace (48th check Mon 3 Aug 2026 UTC, 10th today)
Reporter: PG | Area: Booking / Class | Sheet row: 25

Root Cause (fresh 3 Aug 2026 UTC):
- BC 24686 (Morning General, bk1611, Jul 20-Sep 18 2026): active=true, 0 SCAs
- BC 1797 (Morning General, bk1611, Apr 6-Jun 26 2026): active=true (38d+ stale), 1 SCA (class 12)
- CORRECTION: BC 24686 start_date=2026-07-20 (NOT 2026-08-03 as in addendums -3aug-a to -d). No shunt dependency.
- Student needs SCA on BC 24686. Today=bank holiday; first class TOMORROW Tue 4 Aug.

Fix Recipe (NOT YET RUN):
Step 1: UPDATE booking_courses SET active=false WHERE id=1797;
Step 2: INSERT INTO student_class_assignments (booking_course_id,student_id,class_id,week_start,week_end)
        SELECT 24686,b.student_id,12,2026-08-04,2026-09-18 FROM bookings b WHERE b.id=1611;
        (verify class_id 12=Morning General first)
Step 3: SELECT sca.id,sca.class_id,sca.week_start,sca.week_end FROM student_class_assignments sca WHERE sca.booking_course_id=24686;

Risk: bookings/class | Reversible: yes | Blast: 1 student (Alberto Squillace)
Status: 48th check Mon 3 Aug 2026 UTC (10th today). BC 24686 start=Jul 20 (not Aug 3 -- corrected). 0 SCAs. First class TOMORROW. URGENT.
Last checked: 2026-08-03 UTC