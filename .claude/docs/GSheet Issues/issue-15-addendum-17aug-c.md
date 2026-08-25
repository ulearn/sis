# Issue 15 — Saikhantes Shagdarsuren (143rd check, 17 Aug 2026 UTC)
Reporter: | Area: Booking/Class | Sheet row: 16

## Symptom
Holiday misalignment; no class assignment on return Aug 21.

## Root cause (evidence)
- Student 1001 (Saikhantes Shagdarsuren), Booking 18151: CONFIRMED, amountPaid = EUR 1,339.20, amountOpen = EUR 0
- Booking Course 24925 (Academic Year Afternoon): start 2026-03-09, end 2026-10-02, active = true
- Student Class Assignment 255: class 11, weekStart 2026-01-12, weekEnd 2026-07-03 — the ONLY SCA; expired 45 days ago
- No SCA covering week of Aug 21 or later — student will not appear in class
- Holiday covers Jul 20 to Aug 21 2026; student returns Thursday 21 Aug 2026 (4 DAYS)
- First teaching Monday after return: 24 Aug 2026

## Fix recipe (NOT YET RUN)

Step 1 — Confirm class assignment with AC (class 11 used previously).

Step 2 — Insert SCA for Mon 24 Aug to BC end date 2 Oct 2026:
  Via SIS admin UI: student 1001, booking course 24925, class 11, week starting 2026-08-24.
  OR via direct DB insert (run in psql/node, not here):
  INSERT INTO StudentClassAssignment (bookingCourseId,classId,weekStart,weekEnd,studentId)
    VALUES (24925, 11, '2026-08-24', '2026-10-02', 1001);

Step 3 — Verify:
  SELECT id,classId,weekStart,weekEnd FROM StudentClassAssignment WHERE studentId = 1001 ORDER BY weekStart;
  SELECT id,startDate,endDate FROM BookingHoliday WHERE bookingId = 18151;

## Risk / Category
Bookings + attendance | Reversible (delete SCA if wrong) | Blast radius: 1 student

## Status
OPEN — fix NOT RUN. Returns Thu 21 Aug (4 days). SCA 255 expired 45d. URGENT.
Last checked: 2026-08-17 UTC (143rd check)
