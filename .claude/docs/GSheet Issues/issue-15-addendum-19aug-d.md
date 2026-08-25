Issue 15 - Saikhantes (addendum 19 Aug 2026 D)
Reporter: AC | Area: Booking / Class | Sheet rows: 16 and 30

Symptom: No active SCA since 3 Jul 2026. Student returns approx 25 Aug 2026.
Also: stale 2025 Booking Course 1982 still marked active.

Root cause - Primary (SCA gap):
- Booking 18151 (student 1001): CONFIRMED, paid EUR 1,339.20
- Booking Course 24925 (Academic Year Afternoon, class_id 11): 9 Mar to 2 Oct 2026, active = true
- Last SCA: id 255, week_end 2026-07-03 — 47 days with no SCA on active course
- Student returns approx Mon 25 Aug 2026

Root cause - Secondary (stale 2025 BC):
- Booking Course 1982 (Academic Year Morning): end 2025-12-19, active = true — 8 months stale

Fix recipe (NOT YET RUN)

Step 1 — Create SCA for return week (Mon 25 Aug 2026)
Via SIS admin UI: Booking 18151 > Booking Course 24925 > add class assignment, class 11, week starting Mon 25 Aug.
SQL: INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end, student_id, created_at)
       VALUES (24925, 11, '2026-08-24', '2026-08-28', 1001, NOW()); -- NOT YET RUN

Step 2 — Deactivate stale Booking Course 1982
SQL: UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 1982; -- NOT YET RUN
Verify: SELECT id, name, end_date, active FROM booking_courses WHERE id = 1982; -- expect end_date=2025-12-19, active=true

Risk: SCA reversible; BC 1982 deactivate is data-hygiene/reversible. Blast radius: student 1001 only.

Status: Open — fix NOT RUN. Last checked: 2026-08-19 UTC (173rd / 136th check)