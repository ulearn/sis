# Issue 15 - Saikhantes Shagdasuren (CRITICAL: No SCA)
Reporter: AC/Paul | Row 16 | 500th run Mon 24 Aug 2026 UTC

## Root cause (verified 500th run)
- SCA 255: classId 11, weekEnd 3 Jul 2026 -- expired 52 days ago
- BC 24925 (Academic Year Afternoon): active, ends 2 Oct 2026 -- 39 days left
- BC 24925 has only 1 SCA (id 255, expired) -- zero current class assignments
- Student attended class 11 for 52 days without a valid assignment
- Attendance tracking gap: no SCA means attendance not recorded since Jul 3

## Fix recipe (NOT YET RUN)

Create new SCA via SIS admin UI:
  Open Booking Course 24925
  Add class assignment: classId = 11, weekStart = 6 Jul 2026, weekEnd = 2 Oct 2026

Or via SQL:
  INSERT INTO student_class_assignment
    (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES
    (24925, 1001, 11, date 2026-07-06, date 2026-10-02);

Note: confirm student is still in class 11 with Paul before running.

## Risk
- Category: data-hygiene / attendance
- Reversible: yes (delete SCA if wrong)
- Blast radius: single student (Saikhantes Shagdasuren, student 1001)

## Status
Open. 52 days of attendance untracked. Urgent.

## Last checked
500th run Mon 24 Aug 2026 UTC
