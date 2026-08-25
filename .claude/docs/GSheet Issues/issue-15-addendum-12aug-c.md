# Issue 15 - Saikhantes Shagdarsuren (107th check 12 Aug 2026)

Reporter: AC | Area: Booking/Class | Sheet row: 16

## Symptom
Course dates wrong; student unassigned from class since Jul 3 2026.

## Root Cause (107th check — unchanged)
- Booking 18151: CONFIRMED, EUR 1,339.20 paid, EUR 0 open, student 1001
- service_end = 2026-08-07 — 5 days expired (course ends Oct 2 2026)
- Booking Course 24925 (Academic Year Afternoon, Mar 9 to Oct 2 2026): active = true
- Class Assignment 255: classId = 11, weekEnd = 2026-07-03 — 40 days expired
- Student untracked since 3 Jul 2026 (40 days with no valid class assignment)

## Fix Recipe (NOT YET RUN)
1. UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;
2. UPDATE student_class_assignments SET week_end = '2026-10-02' WHERE id = 255;
3. Reconcile Booking 18151 in Xero.

## Risk
Category: bookings/attendance. Reversible. Blast radius: 1 student.

## Status
Fix NOT RUN. 107th consecutive check.
Last checked: Wed 12 Aug 2026 UTC ~21:00 (107th check)