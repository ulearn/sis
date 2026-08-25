Issue 29 & 15 -- Saikhantes Shagdarsuren (Student 1001): Wrong Course Start Date + Missing Return SCA
Check: 114th, Mon 17 Aug 2026 UTC | Reporter: AC | Row: 30

ROOT CAUSE -- CURRENT STATE (verified 17 Aug 2026)

Same student and same booking as Issue 15 (row 16). Duplicate tracking row.
Booking 18151: CONFIRMED, paid EUR 1,339.20, open EUR 0.
Booking Course 24925 (Academic Year Afternoon): active, start=2026-03-09, end=2026-10-02.
Holiday 2500: startDate=2026-07-20, endDate=2026-08-21 -- ends Fri 21 Aug; return Mon 24 Aug.

NEW ANOMALY (first seen 17 Aug 2026 -- same as Issue 15):
  booking.serviceEnd = 2026-08-07 -- wrong by 56 days (must be 2026-10-02).

Student Class Assignment 255: classId=11, weekEnd=2026-07-03 -- expired 45 days ago.
No return SCA for the Aug 24 -- Oct 2 period.

Original issue (migration bug): Course start date showed 2026-01-12 in Fidelo arrivals.
Confirmed correctly stored as 2026-03-09 in SIS -- that part is resolved.
Outstanding work is the same as Issue 15: fix serviceEnd + insert return SCA.

FIX RECIPE -- NOT YET RUN

Follow the exact steps in issue-15-addendum-17aug-h.md (same booking, same SCA target).

Step 1 -- Extend service_end on Booking 18151:
  UPDATE Booking SET serviceEnd='2026-10-02', updatedAt=NOW() WHERE id=18151;

Step 2 -- Create return Student Class Assignment (if not already done via Issue 15 fix):
  INSERT INTO StudentClassAssignment
    (studentId,classId,bookingCourseId,weekStart,weekEnd,createdAt,updatedAt)
  VALUES
    (1001, 11, 24925, '2026-08-24', '2026-10-02', NOW(), NOW());
  Verify no duplicate:
    SELECT id FROM StudentClassAssignment
    WHERE studentId=1001 AND bookingCourseId=24925 AND weekStart='2026-08-24';
  Expect: exactly 1 row.

RISK
  Category: Bookings + Class Assignment | Reversible: Yes
  Blast radius: Single student. If Issue 15 fix already applied, only verify -- no second insert.
  Urgency: URGENT -- return Mon 24 Aug (7 days).

STATUS: Open -- Fix NOT RUN | Last checked: Mon 17 Aug 2026 UTC (114th check)
