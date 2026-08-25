# Issue 15 — Saikhantes Shagdarsuren (152nd check, Mon 17 Aug 2026 UTC)
Reporter: AC | Area: Booking/Class | Sheet row: 16

## Root cause (verified)
- Booking 18151: CONFIRMED, confirmed=true, paid EUR 1,339.20, open EUR 0
- Booking Course 24925 (Academic Year Afternoon): active, 2026-03-09 to 2026-10-02
- service_end = 2026-08-07 — 10 days past; must extend to 2026-10-02 (course end)
- Holiday 2500: ends Fri 21 Aug (4 days); student returns Mon 24 Aug (7 days)
- Student Class Assignment 255: class 11, week_end 2026-07-03 — no return SCA

## Fix recipe (NOT YET RUN)
Step 1 — Extend service_end on Booking 18151:
  UPDATE booking SET service_end = 2026-10-02, updated_at = NOW() WHERE id = 18151;
  Verify: SELECT service_end FROM booking WHERE id = 18151; -- Expect: 2026-10-02

Step 2 — Insert return SCA:
  INSERT INTO student_class_assignment
    (student_id, class_id, booking_course_id, week_start, week_end, created_at, updated_at)
  VALUES (1001, 11, 24925, 2026-08-24, 2026-10-02, NOW(), NOW());
  SCA 255 remains as historical record — do not delete.

## Risk: Bookings + Class Assignment | Reversible | URGENCY HIGH — return Mon 24 Aug (7d)
## Status: OPEN — Fix NOT RUN | Last checked: Mon 17 Aug 2026 UTC (152nd check)