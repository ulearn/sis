Issue 15 status — Saikhantes Shagdasuren 185th check Thu 20 Aug 2026 (late night)
No change since 184th check (night). DB verified.

Student Class Assignment 255: booking_course_id 24925, week_start 2026-01-12, week_end 2026-07-03, class_id 11
48 days since coverage ended — no new assignment added

Booking Course 24925 (Academic Year Afternoon): active, ends 2 Oct 2026 — correct
Booking Course 1982 (Academic Year Morning): active, ended 19 Dec 2025 — 244 days stale

Student returns Tue 25 Aug 2026
Deadline: Mon 24 Aug 2026 (4 days)

Fix NOT RUN

Step 1 URGENT before Mon 24 Aug: confirm with Paul/Adriana that class 11 is still correct for Saikhantes
Step 2 insert new SCA:
INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
VALUES (24925, 1001, 11, '2026-08-24', '2026-08-28');

Step 3 deactivate stale morning course:
UPDATE booking_courses SET active = false WHERE id = 1982;

Note: SCA covers one week; will need another SCA insert each subsequent week until course ends 2 Oct 2026.