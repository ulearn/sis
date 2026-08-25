Issue 39 - Xuezhen Huang: No Class Assignment (Addendum 22 Jul 2026 L)
Reporter: KC | Area: Booking / Accomm | Sheet row: 41

Root cause (54th hourly check, Wed 22 Jul 2026 UTC, 79th total):
- BC24609 (Xuezhen Huang, student 14443): Morning General, 13 Jul to 31 Jul 2026
- Zero class assignments — STILL 0 SCAs (fresh DB confirmed)
- 7 school days remaining: Thu 23, Fri 24, Mon 27, Tue 28, Wed 29, Thu 30, Fri 31 Jul
- BA11358: Host Family, bed 180, 12 Jul to 2 Aug 2026, active — correct ongoing stay
UNCHANGED. Fix NOT RUN.

Fix recipe (NOT YET RUN):
INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
VALUES (24609, class_id, 2026-07-20, 2026-07-24);  -- this week
VALUES (24609, class_id, 2026-07-27, 2026-07-31);  -- final week

Status: URGENT — 7 school days left; course ends Fri 31 Jul. Fix NOT RUN. Last checked: Wed 22 Jul 2026 UTC.