# Issue 15: Saikhantes Shagdarsuren — service_end expired / SCA expired (108th check Thu 13 Aug 2026)

Reporter: ST | Area: Booking/Class | Sheet row 16

## Root cause (live data, 13 Aug 2026 UTC)
- Booking 18151 (Saikhantes Shagdarsuren, student 14291): CONFIRMED, confirmed=true, EUR 1339.20 paid, EUR 0 open
- service_end = 2026-08-07 — expired 6 days (today 13 Aug); correct value = 2026-10-02 (BC 24925 ends Oct 2)
- Booking Course 24925 (Academic Year Afternoon PM): ends 2026-10-02, active=true, 1 class assignment
- Class Assignment 255: classId=11 (B1 PM), weekStart=2026-01-12, weekEnd=2026-07-03 — expired 41 days
- Student still in course until Oct 2. No change from 107th check (Wed 12 Aug).

## Fix recipe — NOT YET RUN
1. Fix service_end on booking 18151:
   SQL: UPDATE booking SET service_end = 2026-10-02 WHERE id = 18151;
2. Extend SCA 255 weekEnd to match the course end:
   SQL: UPDATE student_class_assignment SET week_end = 2026-10-02 WHERE id = 255;
3. Verify: SELECT id, service_end FROM booking WHERE id=18151; SELECT id, week_end FROM student_class_assignment WHERE id=255;
## Risk
Bookings/class — reversible. service_end affects portal access; SCA weekEnd affects attendance display.
## Status
Open — service_end 6d expired, SCA weekEnd 41d expired. Fix NOT RUN. Last checked: 2026-08-13 UTC