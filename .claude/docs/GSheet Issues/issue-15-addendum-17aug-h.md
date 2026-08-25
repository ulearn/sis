Issue 15 -- Saikhantes Shagdarsuren (Student 1001): Missing Return SCA + Wrong service_end
Check: 150th, Mon 17 Aug 2026 UTC | Reporter: AC | Row: 16

ROOT CAUSE -- CURRENT STATE (verified 17 Aug 2026)

Booking 18151: CONFIRMED, confirmed=true, amountPaid=EUR 1,339.20, amountOpen=EUR 0.
Booking Course 24925 (Academic Year Afternoon): active, start=2026-03-09, end=2026-10-02.
Holiday 2500: startDate=2026-07-20, endDate=2026-08-21 -- holiday ends Fri 21 Aug (4 days).
Return: Monday 24 Aug 2026 (7 days from check date).

NEW ANOMALY (first seen 17 Aug 2026):
  booking.serviceEnd = 2026-08-07 -- wrong by 56 days.
  Course ends 2026-10-02; serviceEnd must match.
  This means the booking service period closed 10 days ago while student is still enrolled.

Student Class Assignment 255: classId=11, weekStart=2026-01-12, weekEnd=2026-07-03.
  Expired 45 days ago -- the last active SCA ended Jul 3 (pre-holiday).
  No new SCA exists for the return period (Aug 24 -- Oct 2).

FIX RECIPE -- NOT YET RUN

Step 1 -- Extend service_end on Booking 18151:
  UPDATE Booking SET serviceEnd='2026-10-02', updatedAt=NOW() WHERE id=18151;
  Verify: SELECT serviceEnd FROM Booking WHERE id=18151;
  Expect: 2026-10-02

Step 2 -- Create return Student Class Assignment:
  INSERT INTO StudentClassAssignment
    (studentId,classId,bookingCourseId,weekStart,weekEnd,createdAt,updatedAt)
  VALUES
    (1001, 11, 24925, '2026-08-24', '2026-10-02', NOW(), NOW());
  Verify: SELECT id,classId,weekStart,weekEnd FROM StudentClassAssignment
          WHERE studentId=1001 AND bookingCourseId=24925 ORDER BY weekStart DESC LIMIT 3;
  Expect: new row with weekStart=2026-08-24, weekEnd=2026-10-02, classId=11
  (SCA 255 weekEnd=2026-07-03 remains as historical record -- do not delete)

RISK
  Category: Bookings + Class Assignment | Reversible: Yes (DELETE new SCA; revert serviceEnd)
  Blast radius: Single student (Saikhantes), 1 SCA insertion, 1 booking field update.
  Urgency: URGENT -- student returns Mon 24 Aug (7 days). SCA must exist before Monday.

STATUS: Open -- Fix NOT RUN | Last checked: Mon 17 Aug 2026 UTC (150th check)
