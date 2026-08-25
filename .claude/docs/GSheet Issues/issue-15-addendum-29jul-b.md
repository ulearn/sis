Issue 15 — Saikhantes Shagdarsuren — Class Assignment (129th check, 29 Jul 2026)

Reporter: PG | Area: Booking / Class | Sheet row: 16 (also row 30 = Issue 29 duplicate)

Symptom
=======
Course dates and holidays make no sense. Renewal student needs new class assignment after holiday.

Root cause (DB, 29 Jul 2026 UTC)
=================================
- Student 1001 (Saikhantes Shagdarsuren): last updated 2026-07-28 09:38 UTC.
- Booking course 24925 (Academic Year Afternoon, bk 18151): active=true, 9 Mar - 2 Oct 2026.
- SCA 255: week_start=2026-01-12, week_end=2026-07-03, class_id=11, bc=24925 — expired 26 days ago.
- Only 1 SCA exists for student 1001. No new assignment created.
- Student on holiday: booking_holiday 2500, 20 Jul - 21 Aug 2026.
- Returns: Mon 24 Aug 2026 (first school day after holiday).
- Hash change this run = formatting artefact in sheet B/G (trailing whitespace); DB unchanged.

Fix recipe — NOT YET RUN
=========================
No urgency until student returns Mon 24 Aug. Act before 24 Aug.

Step 1 — Verify BC 24925 end date
NOT YET RUN:
  SELECT id, name, start_date, end_date, active FROM booking_courses WHERE id = 24925;

Step 2 — Create new SCA from Mon 24 Aug 2026
Via SIS admin UI (preferred): student 1001 -> BC 24925 -> Add class assignment
  Week start: Mon 24 Aug 2026
  Week end: Fri 2 Oct 2026 (BC end date)
  Class: 11

OR via SQL:
NOT YET RUN:
  INSERT INTO student_class_assignments
    (booking_course_id, student_id, class_id, week_start, week_end, created_at)
  VALUES (24925, 1001, 11, '2026-08-24', '2026-10-02', NOW());

Step 3 — Verify
NOT YET RUN:
  SELECT * FROM student_class_assignments WHERE booking_course_id = 24925 ORDER BY week_start;
  Should show SCA 255 (expired) + new SCA from 24 Aug.

Risk / category
===============
Class assignment. Low blast radius; reversible.
No urgency — student on holiday until 24 Aug.

Status
======
OPEN — Fix NOT RUN. 129th check 29 Jul 2026 UTC.
Hash artefact (sheet formatting only; no DB change). Student returns Mon 24 Aug.

Last checked
============
2026-07-29 UTC
