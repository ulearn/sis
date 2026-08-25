# Issue 12 - Rakan Alghamdi: Day 8, No Class Assignment (Mon 10 Aug - 2nd check)

Reporter: ST | Area: Booking / Accomm | Sheet row: 13

## Root Cause (147th check - Mon 10 Aug 2026 UTC)
Booking Course 25035 (Rakan Alghamdi, student 14444) still has 0 class assignments on day 8.

Evidence:
- Booking Course 25035: General English Academic Year AM (Plus), start 2026-08-03, end 2026-12-18, active = true
- Days since course start: 7 (day 8)
- Class assignments: 0
- Booking CONFIRMED, confirmed = true, EUR 9,138.75 fully paid (EUR 0 open)

No change since 146th check.

## Fix Recipe (NOT YET RUN)
Step 1: SIS Admin -> Class Assignment -> find Booking Course 25035 (Rakan Alghamdi) -> assign to appropriate AM class.
Step 2 - Verify:
  SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 25035;
  -- Should return 1 or more

## Risk
Category: bookings / class operations | Reversible: yes | Blast radius: 1 student (Rakan Alghamdi) in school 8 days without a class

## Status: CRITICAL - Day 8, Student In School Without Class
Last checked: 2026-08-10 UTC (147th hourly check)