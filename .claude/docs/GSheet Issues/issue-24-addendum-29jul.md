# Issue 24 - Alberto Squillace - 141st check Wed 29 Jul 2026 UTC

Reporter: PG | Area: Booking | Sheet row: 25

## Symptom
Short-term student with bereavement holidays in Fidelo. Two courses in SIS, no second HubSpot deal. Not assigned to class.

## Root cause (live DB, Wed 29 Jul 2026)
- Student 1052 (Alberto Squillace): booking 1611 Confirmed, EUR 1280.12 / 1280.12 fully paid
- Booking course 24686 (Morning General, 20 Jul-18 Sep 2026): active = true, fee = null, 0 class assignments
- 8 teaching days lost since course start (Mon-Fri 20-24 Jul, Mon 27, Tue 28, Wed 29 Jul)
- 51 calendar days remain to course end (18 Sep 2026)

## Fix recipe (NOT YET RUN)

Step 1 - Assign student 1052 to Morning General class on BC 24686:
  Via SIS admin: Student 1052 -> Bookings -> BC 24686 -> assign to class
  Or DB: INSERT INTO student_class_assignments (student_id, booking_course_id, class_id)
    VALUES (1052, 24686, <morningGeneralClassId>);

Step 2 - Set fee on BC 24686:
  Verify expected fee from HubSpot deal / booking 1611.
  UPDATE booking_courses SET fee = <amount> WHERE id = 24686;

## Risk
Category: bookings/class | Reversible: yes | Blast radius: 1 student, 8 teaching days lost; 51 remain.

## Status
URGENT - FIX NOT RUN. 8 teaching days lost. 0 class assignments. Fee null. Course ends Sep 18.

Last checked: Wed 29 Jul 2026 UTC (141st hourly check)