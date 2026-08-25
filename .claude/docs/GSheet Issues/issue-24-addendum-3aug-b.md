Issue 24 — Alberto Squillace (40th check, 2nd on Aug 3)
Sheet row: 25

Status: Mon 3 Aug 2026 UTC, 2nd check. STUDENT RETURNS TOMORROW (Tue 4 Aug).

Fresh DB confirms:
- Student 1052, booking 1611: CONFIRMED, EUR 1,280.12 paid, EUR 0 open.
- BC 24686 (Morning General, Jul20-Sep18): active, 0 SCAs. No holidays on bk1611.
- BC 1797 (Morning General, Apr6-Jun26): active — 38d stale.
- BC 24686 start=Jul20, NOT in Aug3 shunt. Needs manual SCA for week Tue 4 Aug.
- Prior SCA class=12 (BC 1797, SCA id=229). Use same class unless level changed.
- Unchanged from 1st-today (issue-24-addendum-3aug.md).

Fix recipe (NOT YET RUN):
1. Deactivate BC 1797: UPDATE booking_courses SET active=false WHERE id=1797;
2. Create SCA on BC 24686: student 1052, class 12, week_start=2026-08-03.
   INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
   VALUES (24686, 1052, 12, 2026-08-03, 2026-08-07);
   (Confirm class_id if level changed; confirm week_end convention.)

Risk: bookings — reversible — 1 student. URGENT: returns tomorrow.
Status: NOT RUN — 40th check, 2nd Mon 3 Aug 2026 UTC.