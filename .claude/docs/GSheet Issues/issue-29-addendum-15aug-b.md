# Issue 29 -- Saikhantes Shagdarsuren: service_end expired 8 days ago, SCA 43 days expired (89th check, 15 Aug 2026)

Reporter: pg | Area: Booking / Class | Sheet row: 30

## Symptom
Course dates wrong (Fidelo migration artefact). Ongoing: service_end and SCA weekEnd both expired while student is actively attending.

## Root cause (verified 15 Aug 2026 UTC - 89th check)
- Booking 18151 (Saikhantes Shagdarsuren, student 1001): status = CONFIRMED, confirmed = true
  - amountPaid = EUR 1,339.20, amountOpen = EUR 0 -- fully paid
  - service_end = 2026-08-07 -- expired 8 days ago (student still in class via BC 24925)
  - Last updated 2026-07-08 (38 days ago -- no admin action since)
- Booking Course 24925 (Academic Year Afternoon): endDate = 2026-10-02, active = true -- correct
- Student Class Assignment 255: weekStart = 2026-01-12, weekEnd = 2026-07-03 -- expired 43 days ago, classId = 11
- Holiday 2500: Jul 20 - Aug 21 2026 -- student on holiday; returns Thu Aug 21 (6 days)
- No newer booking for student 1001 (only prior booking 1724, service_end Dec 2025)

URGENT: SIS shows service_end Aug 7 -- compliance checks and visa letters will show student as departed.
URGENT: Student returns Aug 21 -- needs active SCA before then.

## Fix recipe (NOT YET RUN)

Step 1 -- Extend booking service_end to match BC 24925 end date:
  SQL: UPDATE bookings SET service_end = 2026-10-02 WHERE id = 18151; -- NOT YET RUN

Step 2 -- Extend or create SCA for period Aug 21 - Oct 2 (class 11):
  Option A (extend): UPDATE student_class_assignments SET week_end = 2026-10-02 WHERE id = 255; -- NOT YET RUN
  Option B (new): INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
    VALUES (24925, 11, 2026-08-24, 2026-10-02); -- NOT YET RUN

Step 3 -- BC 24925 endDate = 2026-10-02, active = true -- no change needed.

Step 4 -- Confirm with academic team that student 1001 is still attending class 11.

## Risk / category
Bookings / data-hygiene. Reversible. Blast radius: 1 student.
Compliance risk: documents show incorrect end date.

## Status: OPEN -- URGENT (service_end 8d expired; SCA 43d expired; student returns Aug 21).
Last checked: 2026-08-15 UTC (89th check / 295th run)