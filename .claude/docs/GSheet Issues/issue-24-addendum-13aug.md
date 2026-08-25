# Issue 24: Alberto Squillace — BC 24686 0 class assignments (72nd check Thu 13 Aug 2026)

Reporter: multiple | Area: Booking | Sheet row 25

## Root cause (live data, 13 Aug 2026 UTC)
- Booking Course 24686 (Alberto Squillace, student 1052, Morning General): started 2026-07-20, ends 2026-09-18, active=true
- 0 class assignments — 24 calendar days (~18 school days) of attendance unrecorded
- 36 calendar days remaining until course end (Sep 18)
- No change from 71st check (Wed 12 Aug).

## Fix recipe — NOT YET RUN
1. Confirm which class Alberto attends (Morning General — confirm class ID with admin).
2. Create SCA on BC 24686:
   SQL: INSERT INTO student_class_assignment (booking_course_id, class_id, week_start, week_end)
        VALUES (24686, <class_id>, 2026-07-20, 2026-09-18);
   Or assign via the SIS admin UI.
## Risk
Bookings/class — reversible (delete SCA if wrong). 18 school days of attendance will not be retroactively added.
## Status
Open — Day 24. 18 school days lost. Fix NOT RUN. Last checked: 2026-08-13 UTC