Issue 29 & 15 -- Saikhantes Shagdarsuren (110th check, 17 Aug 2026 UTC)
Reporter: PG | Area: Booking/Class | Sheet row: 30

Symptom
Course start date anomaly (2026-01-12 in Fidelo); no class assignment on return Aug 21.

Root cause (evidence)
- Student 1001 (Saikhantes Shagdarsuren), Booking 18151: CONFIRMED, amountPaid = EUR 1,339.20, amountOpen = EUR 0
- Booking Course 24925 (Academic Year Afternoon): start 2026-03-09, end 2026-10-02, active = true -- correct start date
- Student Class Assignment 255: class 11, weekStart 2026-01-12, weekEnd 2026-07-03 -- expired 45 days ago; no return SCA
- Student returns Thursday 21 Aug 2026 (4 days) -- URGENT

Fix recipe (NOT YET RUN)

Same fix as Issue 15. Insert SCA for Mon 24 Aug (NOT here):
  INSERT INTO StudentClassAssignment (bookingCourseId,classId,weekStart,weekEnd,studentId)
    VALUES (24925, 11, '2026-08-24', '2026-10-02', 1001);

Risk / Category
Bookings + attendance | Reversible | Blast radius: 1 student

Status
OPEN -- fix NOT RUN. Returns Thu 21 Aug (4 days). SCA 255 expired 45d. URGENT.
Last checked: 2026-08-17 UTC (110th check)