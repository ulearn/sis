# Issue 15 — Saikhantes Shagdarsuren Class Assignment Gap (200th check, 22 Aug 2026)

**Sheet row:** 16

## Root cause
- Student 1001 (Saikhantes Shagdarsuren)
- BC 24925 (Academic Year Afternoon, booking 18151): active, Mar 9 to Oct 2 2026.
- Only 1 SCA on BC 24925: id 255, class 11, week ending 3 Jul 2026.
- Gap: Jul 3 to Aug 22 = 50 days with no class assignment.
- Student returns Tue 25 Aug. SCA must cover week ending 28 Aug before Monday 24 Aug.
- Fix not run in 200 checks.

## Fix recipe (NOT YET RUN)
- Confirm class: SELECT id, name FROM class WHERE id = 11;
- Insert SCA for week ending 28 Aug 2026:
    INSERT INTO student_class_assignment (booking_course_id, class_id, week_end, created_at, updated_at)
    VALUES (24925, 11, 2026-08-28, NOW(), NOW());
- Optional back-fill weeks Jul 10, 17, 24, 31, Aug 7, 14, 21 -- check with AC/Neil.
- Verify: SELECT id, class_id, week_end FROM student_class_assignment WHERE booking_course_id = 24925 ORDER BY week_end;

## Risk
Bookings/class-assignments. Reversible. Single student 1001.
URGENT: deadline Mon 24 Aug 2026.

**Last checked:** Sat 22 Aug 2026 UTC (200th check, 7th today)