# Issue 15 — Saikhantes Shagdarsuren (141st check, 17 Aug 2026 UTC)
Reporter: | Area: Booking/Class | Sheet row: 16

## Symptom
Course dates and holidays make no sense; student not appearing in arrivals/assignments.

## Root cause (evidence)
- Student 1001 (Saikhantes Shagdarsuren), Booking 18151: CONFIRMED, EUR 1,339.20 fully paid
- Booking serviceEnd = 2026-08-07 — EXPIRED 10 days ago (booking still active per BC 24925)
- Booking Course 24925 (Academic Year Afternoon): Mar 9 to Oct 2 2026, active = true
- Student Class Assignment 255: class 11, weekStart 2026-01-12, weekEnd 2026-07-03 — EXPIRED 45 days ago
- SCA expired July 3, 17 days BEFORE holiday started July 20 — student had no class from July 3
- Holiday 2500: Jul 20 to Aug 21 2026 — student returns Thu 21 Aug (4 DAYS FROM NOW)
- On return Aug 21: no active SCA and booking serviceEnd already passed — will not appear in to-be-assigned

## Fix recipe (NOT YET RUN)

Step 1 — Update booking serviceEnd to BC 24925 end date:
  UPDATE Booking SET serviceEnd = '2026-10-02', updatedAt = NOW() WHERE id = 18151;

Step 2 — Create SCA for week starting Aug 24 (first Mon after Aug 21 return):
  INSERT INTO StudentClassAssignment (bookingCourseId,classId,weekStart,weekEnd,studentId,createdAt,updatedAt)
    VALUES (24925, 11, '2026-08-24', '2026-10-02', 1001, NOW(), NOW());

Step 3 — Verify no gap and holiday intact:
  SELECT id, classId, weekStart, weekEnd FROM StudentClassAssignment WHERE studentId = 1001 ORDER BY weekStart;
  SELECT id, startDate, endDate FROM BookingHoliday WHERE bookingId = 18151;

## Risk / Category
Bookings + attendance | Reversible | Blast radius: 1 student (Saikhantes Shagdarsuren)

## Status
OPEN — fix NOT RUN. Student returns in 4 days (Thu Aug 21). SCA expired 45d ago. serviceEnd expired 10d ago.
Last checked: 2026-08-17 UTC (141st check)