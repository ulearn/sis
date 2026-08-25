Issue 22 - Edith Nunes: No Class Assignment (Addendum 22 Jul 2026 J)
Reporter: PG | Area: Booking / Class | Sheet row: 23

Root cause (51st hourly check, Wed 22 Jul 2026 UTC, 74th total):
- BC24991 (Edith Nunes, student 1015, booking 18214): General English AM, 13 Jul to 7 Aug 2026
- Zero class assignments — STILL 0 SCAs (fresh DB confirmed)
- 9 school days missed (Mon 13 Jul through Wed 22 Jul); 12 remaining (Thu 23 Jul to Fri 7 Aug)
- Aug BH 3 Aug absent from school_closures (Issue 38) — 11 remaining if fixed
UNCHANGED. Fix NOT RUN.

Fix recipe (NOT YET RUN):
Assign BC24991 to General English AM class from Thu 23 Jul or Mon 27 Jul.
INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
VALUES (24991, class_id, 2026-07-20, 2026-07-24);  -- this week
VALUES (24991, class_id, 2026-07-27, 2026-07-31);  -- and each week through Aug 7

Status: CRITICAL — 9 school days lost; 12 remaining. Fix NOT RUN. Last checked: Wed 22 Jul 2026 UTC.