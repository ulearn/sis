# Issue 12 — Rakan Alghamdi — SCA 288 on Wrong Booking Course — 195th check

Reporter: AC | Area: Booking | Sheet row 13

## Root cause (confirmed Mon 24 Aug 2026 UTC)
- BC 24697 (Academic Year Morning, ILEP 0318/0020): ended 2026-07-31, active = true — 24 days stale
- BC 25035 (General English Academic Year AM Plus): ends 2027-01-08, active = true, 0 student class assignments
- SCA 288: class 12, week_start 2026-07-06, week_end 2026-12-18 — linked to BC 24697 (not BC 25035)
- SCA week_end (Dec 18) extends 140 days past BC 24697 end (Jul 31) — on wrong course
- Rakan unclassed since 2026-08-03 = 21 days. No change from 194th check (Sun 23 Aug).

## Fix recipe (NOT YET RUN)
Step 1: UPDATE student_class_assignments SET week_end = '2026-07-31' WHERE id = 288;
Step 2: UPDATE booking_courses SET active = false WHERE id = 24697;
Step 3: INSERT INTO student_class_assignments (class_id, booking_course_id, week_start, week_end) VALUES (12, 25035, '2026-08-03', '2027-01-08');

## Risk
Bookings / class assignments. Reversible. Blast radius: student 14444 (Rakan) only.

## Status
OPEN — Fix NOT RUN. Rakan unclassed 21 days.
Last checked: 2026-08-24 UTC (495th run, 195th issue check)
