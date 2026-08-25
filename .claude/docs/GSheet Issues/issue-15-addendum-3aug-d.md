# Issue 15 - Saikhantes Shagdarsuren SCA (28th check Mon 3 Aug 2026 UTC, 7th today)
Reporter: AC | Area: Booking/Class | Sheet row: 16

Root Cause (fresh):
- Student 1001 (Saikhantes Shagdarsuren): on holiday (Holiday 2500: Jul 20-Aug 21 2026, bk18151)
- Returns Mon 24 Aug 2026 (21 days from today)
- Last SCA: id 255, class 11, week Jan 12-Jul 3 2026 -- expired 31 days ago
- BC 24925 (AY Afternoon, Mar 9-Oct 2 2026, bk18151): active=true -- current course
- BC 1982 (AY Morning, Jun 30-Dec 19 2025, bk1724): active=true -- 229 days stale
- SCA action window: week starting Mon 28 Aug (first full week back)

Fix Recipe (NOT YET RUN):
Step 1: UPDATE booking_courses SET active=false,updated_at=NOW() WHERE id=1982;
Step 2: INSERT INTO student_class_assignments (booking_course_id,student_id,class_id,week_start,week_end) VALUES (24925,1001,11,'2026-08-24','2026-10-02'); -- verify class 11 correct
Step 3: SELECT id,class_id,week_start FROM student_class_assignments WHERE booking_course_id=24925;

Risk: bookings/class | Reversible: yes | Blast: student 1001
Status: 28th check. Returns Aug 24 (21d). BC1982 stale 229d. SCA window opens Aug 28. Fix NOT RUN. Last checked: 2026-08-03 UTC
