# Issue 15 — Saikhantes Shagdarsuren — service_end + SCA expired (111th check Thu 13 Aug 2026 UTC)

No data change since 110th check.

## Evidence
- BK 18151: CONFIRMED, amountPaid=1339.20, serviceEnd=2026-08-07 (expired 6 days), updatedAt=2026-07-08
- BC 24925: Academic Year Afternoon, ends 2026-10-02, active=true, classAssignments=1
- SCA 255: bookingCourseId=24925, classId=11, weekEnd=2026-07-03 (expired 41 days)

## Fix (NOT YET RUN)
UPDATE booking SET service_end = '2026-10-02' WHERE id = 18151;
UPDATE student_class_assignment SET week_end = '2026-10-02' WHERE id = 255;

Risk: Bookings/Class, reversible, 1 booking 1 SCA 1 student
Last checked: Thu 13 Aug 2026 UTC (111th check)