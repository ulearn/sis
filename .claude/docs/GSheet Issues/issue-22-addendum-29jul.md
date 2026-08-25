# Issue 22 - Edite Nunes - 143rd check Wed 29 Jul 2026 UTC

Reporter: PG | Area: Booking / Class | Sheet row: 23

## Symptom
Student not appearing in TBA for wb 18.05.26 - two payments with same invoice number.

## Root cause (live DB, Wed 29 Jul 2026)
- Student 1015 (Edith Nunes): BC 24991 (General English AM, 13 Jul-7 Aug 2026): active = true, 0 class assignments
- Course ends 7 Aug 2026 - 9 days remaining; 0 assignments for entire 16-day course
- Duplicate BCs 24933 + 24934 (booking 18158): both still active, both ended 10 Jul 2026 - 19 days stale

## Fix recipe (NOT YET RUN)

Step 1 - Assign student 1015 to General English AM class on BC 24991:
  Via SIS admin: Student 1015 -> Bookings -> BC 24991 -> assign to class
  Or DB: INSERT INTO student_class_assignments (student_id, booking_course_id, class_id)
    VALUES (1015, 24991, <generalEnglishAMClassId>);

Step 2 - Deactivate duplicate BCs 24933 and 24934:
  UPDATE booking_courses SET active = false WHERE id IN (24933, 24934);

## Risk
Category: bookings/class | Reversible: yes | Blast radius: 1 student, 9 days to course end.

## Status
CRITICAL - FIX NOT RUN. 0 class assignments, 9 days left (ends Aug 7). Dup BCs 24933+24934 19 days stale.

Last checked: Wed 29 Jul 2026 UTC (143rd hourly check)