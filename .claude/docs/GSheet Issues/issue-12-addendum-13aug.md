# Issue 12: Rakan Alghamdi SCA misrouted (167th check Thu 13 Aug 2026)

Reporter: multiple | Area: Booking/Accomm | Sheet row 13

## Root cause (live data, 13 Aug 2026 UTC)
- Booking Course 25035 (Rakan, AM Plus): started 2026-08-03, ends 2026-12-18, active=true, 0 class assignments
- 10 school days of attendance unrecorded (Mon 3 Aug through Thu 13 Aug)
- Student Class Assignment 288: still on OLD Booking Course 24697 (classId=12, weekEnd 2026-12-18) — misrouted
- No change from 166th check (Wed 12 Aug).

## Fix recipe — NOT YET RUN
Step 1 (SQL): UPDATE student_class_assignment SET booking_course_id = 25035 WHERE id = 288;
Step 2 (verify): SELECT id, booking_course_id FROM student_class_assignment WHERE id = 288;

## Risk
Bookings/class. Reversible — one row UPDATE. Blast radius: SCA 288 only.
## Status
Open — 10 school days lost. Fix NOT RUN. Last checked: 2026-08-13 UTC