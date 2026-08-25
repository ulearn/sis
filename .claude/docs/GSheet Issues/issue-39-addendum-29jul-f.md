Issue 39 — Xuezhen Huang — Class Assignment Missing (156th check, 29 Jul 2026)

Reporter: KC | Area: Booking / Accomm | Sheet row: 41

Symptom
=======
Student paid for accommodation and course; no class assignment has ever been created.
Course ends tomorrow (Fri 31 Jul 2026).

Root cause (DB, 29 Jul 2026 UTC)
=================================
- Booking course 24609 (Morning General, booking 17831): active=true, start=2026-07-13, end=2026-07-31.
- 0 student class assignments on BC 24609 (confirmed via student_class_assignments WHERE booking_course_id=24609 -> 0 rows).
- Student 14443 (Xuezhen Huang): confirmed, EUR 1396.90 fully paid.
- Course active for 17 school days with ZERO class attendance record.
- Course ends TOMORROW Fri 31 Jul 2026.
- TODAY (Wed 29 Jul) or Thu 30 Jul = ABSOLUTE LAST CHANCE to act.
- After Fri 31 Jul: class assignment window permanently closed, attendance irrecoverable.

Fix recipe — NOT YET RUN
=========================
URGENT: Act today (Wed 29 Jul) or Thu 30 Jul at absolute latest.

Step 1 — Find the correct Morning General class for week beginning 27 Jul 2026
NOT YET RUN:
  SELECT wcg.id, wcg.name, wcg.level
  FROM weekly_class_groups wcg
  WHERE wcg.name ILIKE '%morning general%'
    AND wcg.start_date <= '2026-07-27'
    AND wcg.end_date >= '2026-07-31';
  (Substitute correct table/column names if different in schema)

Step 2 — Create SCA via SIS admin UI (preferred)
  Student 14443 -> Booking 17831 -> BC 24609 -> Add class assignment
  Week: WB 27 Jul 2026 (Mon 27 Jul - Fri 31 Jul)
  Class: appropriate Morning General group from Step 1

OR via SQL:
NOT YET RUN:
  INSERT INTO student_class_assignments
    (booking_course_id, student_id, class_id, week_start, week_end, created_at)
  VALUES
    (24609, 14443, <class_id_from_step1>, '2026-07-27', '2026-07-31', NOW());

Step 3 — Verify
NOT YET RUN:
  SELECT * FROM student_class_assignments WHERE booking_course_id = 24609;
  Should return 1 row.

Risk / category
===============
Data integrity / attendance. Minimal blast radius (1 student, 1 SCA).
Reversible: DELETE the SCA row if incorrect.
Without fix: student has zero attendance record for 3 weeks of paid tuition.

Status
======
OPEN — Fix NOT RUN. 156th check 29 Jul 2026 UTC.
LAST CHANCE: Act today (Wed 29 Jul) or Thu 30 Jul. Course ends Fri 31 Jul.

Last checked
============
2026-07-29 UTC
