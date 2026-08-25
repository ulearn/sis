# Issue 39 - Xuezhen Huang - 148th check Wed 29 Jul 2026 UTC

Reporter: KC | Area: Booking / Accomm | Sheet row: 41

## Symptom
Student paid for 3 weeks accommodation (12 Jul - 2 Aug 2026). Course not assigned to a class.

## Root cause (live DB, Wed 29 Jul 2026)
- Student 14443 (Xuezhen Huang): booking 17831, EUR 1396.90 fully paid
- Booking course 24609 (Morning General, 13 Jul-31 Jul 2026): active = true, 0 class assignments
- 2 teaching days remain: Thu 30 Jul, Fri 31 Jul 2026
- Student unassigned for entire 12-day run of course

## Fix recipe (NOT YET RUN)

Step 1 - Assign student 14443 to Morning General class on BC 24609:
  Via SIS admin: Student 14443 -> Bookings -> BC 24609 -> assign to class (Morning General)
  Or DB: INSERT INTO student_class_assignments (student_id, booking_course_id, class_id)
    VALUES (14443, 24609, <morningGeneralClassId>);

Step 2 - Verify accommodation for booking 17831:
  Check booking_accommodations for booking 17831 - confirm Jul 12 - Aug 2 present.

## Risk
Category: bookings/class | Reversible: yes | Blast radius: 1 student, 2 teaching days left.

## Status
CRITICAL - FIX NOT RUN. Course ends Fri 31 Jul (2 days). 0 class assignments for entire course.

Last checked: Wed 29 Jul 2026 UTC (148th hourly check)