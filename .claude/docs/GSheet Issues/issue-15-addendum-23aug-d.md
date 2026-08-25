# Issue 15 — Saikhantes Shagdasuren (student 1001)
Reporter: AC/NM | Area: Booking / Class | Sheet rows 16 + 30

## Root cause (472nd run, 23 Aug 2026 UTC)
- Booking Holiday 2500 (booking 18151): ended 2026-08-21 — student back 2 days
- Student Class Assignment 255: class 11 (B1 PM), BC 24925, week_end 2026-07-03 — expired 51 days ago
- Booking Course 24925 (Academic Year Afternoon): active, ends 2026-10-02
- No SCA covers 22 Aug or 24 Aug (her Monday return)
- URGENT: Monday 24 Aug is TOMORROW

## Fix recipe (NOT YET RUN)

Step 1 — Create new Student Class Assignment via SIS admin or DB:
  Student 1001, Class 11 (B1 PM), BC 24925, week_start 2026-08-24, week_end 2026-10-02
  DB: INSERT INTO student_class_assignment (student_id, class_id, booking_course_id, week_start, week_end)
      VALUES (1001, 11, 24925, '2026-08-24', '2026-10-02');

Step 2 (low priority) — Deactivate stale Booking Course 1982:
  UPDATE booking_course SET active = false WHERE id = 1982;

## Risk
Bookings/class — reversible. Blast radius: 1 student, 1 SCA insert.

## Status
FIX NOT RUN. URGENT — Mon 24 Aug is tomorrow.
Last checked: 2026-08-23 UTC (472nd run)