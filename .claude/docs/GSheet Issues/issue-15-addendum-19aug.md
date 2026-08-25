Issue 15 - Saikhantes Shagdasuren (addendum 19 Aug 2026)
Reporter: AC | Area: booking/class | Sheet rows: 16, 30 | Last checked: 2026-08-19 UTC

SYMPTOM
No class assignment exists for her return from holiday Mon 25 Aug. serviceEnd is stale.

ROOT CAUSE (live data, 19 Aug 2026)
- Booking 18151: CONFIRMED, confirmed=true, paid EUR 1,339.20
- serviceEnd = 2026-08-07 (12 days stale) -- student returns Mon 25 Aug (6 days)
- Holiday ends Fri 21 Aug (2 days); back in class Mon 25 Aug (6 days)
- Booking Course 24925 (Academic Year Afternoon): 2026-03-09 to 2026-10-02, active, ILEP 0318/0003
- Class Assignment 255: class 11, weekStart 2026-01-12, weekEnd 2026-07-03 -- ended 3 Jul 2026
- No class assignment for return period Mon 25 Aug to Fri 2 Oct 2026
- SCA 255 weekStart anomaly (Jan 12): known Fidelo migration legacy, not new

FIX RECIPE (NOT YET RUN)

Step 1 - Update booking serviceEnd:
  UPDATE booking SET service_end = '2026-10-02' WHERE id = 18151;
  Verify: SELECT id, service_end FROM booking WHERE id = 18151;

Step 2 - Create return class assignment:
  INSERT INTO student_class_assignment (booking_course_id, student_id, class_id, week_start, week_end, created_at)
  SELECT 24925, b.student_id, 11, '2026-08-25', '2026-10-02', NOW()
  FROM booking b WHERE b.id = 18151;

Step 3 - Notify AC: Saikhantes appears in Class 11 from Mon 25 Aug.

RISK
- Category: bookings / class assignments
- Reversible: yes -- delete SCA if wrong
- Blast radius: single student

STATUS: Open. Return 6 days (Mon 25 Aug). Fix NOT RUN. Prior: issue-15-addendum-18aug.md