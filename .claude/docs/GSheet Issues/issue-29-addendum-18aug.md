Issue 29 & 15 -- Saikhantes Shagdarsuren (119th check, Tue 18 Aug 2026 UTC)
Reporter: PG | Area: Booking/Class | Sheet row: 30

Symptom: Course dates wrong; no return class assignment exists after holiday.

Root cause (verified)
- Student 1001 (Saikhantes Shagdarsuren)
- Booking 18151: CONFIRMED, paid EUR 1,339.20, open EUR 0
- service_end = 2026-08-07 -- 11 days past (must extend to 2026-10-02 to match BC 24925)
- Booking Course 24925 (Academic Year Afternoon): active, 9 Mar to 2 Oct 2026
- Student Class Assignment 255: class 11, week_end 2026-07-03 -- no return SCA
- Returns Monday 24 Aug 2026 -- 6 days -- URGENT

Fix recipe (NOT YET RUN)
Step 1: Extend service_end on Booking 18151:
  UPDATE bookings SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;

Step 2: Insert return Student Class Assignment for class 11:
  INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end, created_at)
  VALUES (1001, 11, 24925, '2026-08-24', '2026-10-02', NOW());
  (Confirm class 11 is still the correct class before running.)

See also: issue-15-addendum-18aug.md for the parallel Issue 15 fix (same student).

Risk: bookings + class assignment | Reversible | URGENCY HIGH -- return Mon 24 Aug (6 days)
Status: OPEN -- Fix NOT RUN | Last checked: Tue 18 Aug 2026 UTC (119th check)