# Issue 15 — Saikhantes Shagdasuren SCA (32nd check Tue 4 Aug 2026 UTC)
Reporter: PG | Area: Booking/class | Sheet row: 16

## Root Cause (verified 2026-08-04 UTC, 32nd check — unchanged)
- Student on holiday, returns Mon 24 Aug 2026 (20 days from now).
- Booking course 24925 (Academic Year Afternoon, 2026-03-09 to 2026-10-02): active = true.
- Class assignment 255: class 11 (B1 PM), week_end = 2026-07-03 — expired 32 days ago, no new SCA.
- Booking course 1982 (legacy Academic Year Afternoon): still active — stale 228+ days.

## Fix Recipe (NOT YET RUN)
Step 1 — Deactivate legacy booking course 1982:
  UPDATE booking_courses SET active = false WHERE id = 1982;
Step 2 — Create new SCA on booking course 24925 (confirm class 11 with Paul first):
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (24925, 11, '2026-08-24', '2026-10-02');

## Risk: bookings | Reversible: yes | Blast radius: 1 student
## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (32nd check) | Returns: Mon 24 Aug 2026