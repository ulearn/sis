Issue 15 Addendum -- Saikhantes Shagdarsuren (student 1001)
Reporter: AC/NM | Area: Booking / Class | Sheet rows 16 + 30

Root cause (476th run, 23 Aug 2026 UTC)

No DB change since 474th run. Booking 18151 confirmed: CONFIRMED, paid EUR 1339.20, open=0. BC 24925 active ends 2 Oct. SCA 255: class 11, weekEnd 3 Jul 2026 expired 51d. Holiday 2500 ended 21 Aug, student back Fri 22 Aug. No SCA covers Mon 24 Aug. STUDENT HAS NO CLASS TOMORROW MON 24 AUG.

Fix recipe (NOT YET RUN)

INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end) VALUES (1001, 11, 24925, 2026-08-24, 2026-10-02);
week_start=2026-08-24 (Monday return), week_end=2026-10-02 (BC 24925 end date)

Verify: SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE student_id = 1001 ORDER BY week_start;

Risk: bookings/class-scheduling | Reversible: DELETE by id | 1 student, 1 insert
Status: FIX NOT RUN. MUST BE DONE BEFORE MONDAY MORNING 24 AUG.
Last checked: 2026-08-23 UTC (476th run)
