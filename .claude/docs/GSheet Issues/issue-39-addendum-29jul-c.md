# Issue 39 addendum 29 Jul 2026 run C

152nd hourly check. Data UNCHANGED since run B.

COURSE ENDS FRI 31 JUL 2026 — 2 SCHOOL DAYS REMAIN (Thu 30, Fri 31)
Window to assign a class closes after tomorrow (Thu 30 Jul).

## Confirmed state (live DB, 29 Jul 2026 UTC)
- Student 14443 (Xuezhen Huang), booking 17831: CONFIRMED, EUR 1396.90 fully paid
- Booking accommodation 11358: bed 180, active = true, 12 Jul to 2 Aug 2026 OK
- Booking course 24609 (Morning General B2, 13 Jul to 31 Jul 2026): active = true
- student_class_assignments WHERE booking_course_id = 24609 -> 0 rows
- Student has 0 class assignments for a 3-week course

## Fix recipe (NOT YET RUN — MUST RUN TODAY OR TOMORROW)

Step 1 — Find available Morning General B2 class for remaining days:
  SELECT c.id, c.name, c.level FROM classes c
  JOIN class_occurrences co ON co.class_id = c.id
  WHERE co.date = 2026-07-30
  AND c.name ILIKE %morning general%
  AND c.level = B2;

Step 2 — Insert SCA for WB 27 Jul:
  INSERT INTO student_class_assignments
    (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES (24609, 14443, <class_id_from_step1>, 2026-07-27, 2026-07-31);

Step 3 — Or use SIS admin: Booking 17831 -> Courses -> BC 24609 -> Assign class WB 27 Jul.

## Risk
Category: bookings/class | Reversible: yes (delete SCA) | Blast radius: 1 student.
Missing SCA: student absent from attendance sheets for final 2 days; cert may show 0 attendance.

## Status
OPEN - CRITICAL - Fix NOT RUN - LAST CHANCE: tomorrow Thu 30 Jul 2026
Last checked: Wed 29 Jul 2026 UTC (152nd hourly check)