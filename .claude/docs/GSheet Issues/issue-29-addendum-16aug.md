Issue 29 and 15 - Saikhantes Shagdarsuren (94th check)
Reporter: ST | Area: booking/class | Sheet row: 30 | Sun 16 Aug 2026 UTC

Symptom
Course dates wrong -- Jan 12 start date appeared; linked to holiday/class issues (also Issue 15).

Root Cause (94th check - 16 Aug 2026 UTC)
- Booking 18151 (student 1001 Saikhantes Shagdarsuren): CONFIRMED, confirmed=true, EUR 1,339.20 fully paid
- Booking Course 24925 (Academic Year Afternoon): 9 Mar to 2 Oct 2026, active=true, 1 class assignment
- serviceEnd = 2026-08-07 -- expired 9 days ago (course ends Oct 2)
- Student Class Assignment 255: weekEnd = 2026-07-03, class 11 -- 44 days without active assignment
- Holiday 2500: 20 Jul to 21 Aug 2026 -- RETURNS IN 5 DAYS (Thu 21 Aug)
- No newer booking for student 1001

Fix Recipe (NOT YET RUN)
See issue-15-addendum-16aug.md for full recipe -- same booking, same fixes.

Step 1 - Update serviceEnd
UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

Step 2 - Create new Student Class Assignment (after Aug 21 return)
INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end)
VALUES (1001, 24925, 11, '2026-08-24', '2026-10-02');

Risk
- Category: bookings / class assignment
- Reversible: yes
- Blast radius: single student
- URGENCY: returns Thu 21 Aug (5d) -- act before Mon 24 Aug

Status: Open -- Fix NOT RUN
Last checked: 2026-08-16 UTC (94th check)
