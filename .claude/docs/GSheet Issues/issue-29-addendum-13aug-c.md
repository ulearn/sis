# Issue 29 & 15 — Saikhantes Shagdarsuren / service_end + SCA expired (13 Aug c)

Reporter: PG | Sheet row: 30 | Last checked: 2026-08-13 UTC (81st hourly check)

## Root cause
- Booking 18151 (Saikhantes, student 1001): CONFIRMED, confirmed=true, EUR 1,339.20 paid, EUR 0 open
- service_end = 2026-08-07 — expired 6 days ago; correct = 2026-10-02 (BC 24925 ends Oct 2)
- Booking last updated: 2026-07-08 (36 days ago)
- BC 24925 (Academic Year Afternoon PM): start 2026-03-09, end 2026-10-02, active=true, 1 SCA
- SCA 255: class_id=11 (B1 PM), week_end=2026-07-03 — expired 41 days ago
- Impact: 41 days (Jul 3 to Aug 13) of attendance tracking lost

## Fix recipe (NOT YET RUN)
Step 1: UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;
Step 2: UPDATE student_class_assignments SET week_end = '2026-10-02' WHERE id = 255;
Step 3: Verify Saikhantes in B1 PM (class 11) for current week.

## Status
Open — service_end 6d expired, SCA 255 41d expired. Fix NOT RUN.
Last checked: 2026-08-13 UTC (81st hourly check)