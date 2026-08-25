# Issue 24 — Alberto Squillace: BC 24686 no class assignment, ~26 school days lost (79th check, 15 Aug 2026)

Reporter: AC | Area: Booking | Sheet row: 25

## Symptom
Short-term student. Course started 20 Jul 2026 but never assigned to a class in SIS — ~26 school days without attendance records.

## Root cause (verified 15 Aug 2026 UTC)
- Booking Course 24686 (Morning General, Alberto Squillace): startDate = 2026-07-20, endDate = 2026-09-18, active = true
- Student Class Assignments on BC 24686: 0
- Approximately 26 school days elapsed since course start (Jul 20 to Aug 15)
- Course ends 2026-09-18 — 34 days remaining; still actionable
- Background: two SIS courses exist — 12-week ended Jun 26 + 9-week BC 24686 starting Jul 20.
  BC 24686 has no HubSpot deal (Fidelo-era artefact) but is the active course.

No change from 78th check (Fri 14 Aug). Elapsed school days increased from ~20 to ~26.

## Fix recipe (NOT YET RUN)

Step 1 — Confirm correct class for Alberto (AM General) with admin staff.

Step 2 — Assign BC 24686 to AM Morning General class (confirm classId):
  SQL: INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
       VALUES (24686, <am_general_class_id>, '2026-07-20', '2026-09-18');

Step 3 — Flag to academic team: ~26 school days of attendance unrecorded (Jul 20 – Aug 15).
  Determine whether ILEP/compliance backfill is required.

## Risk / category
Bookings / class — student unrecorded 26d. Compliance risk: attendance gap for ILEP. Reversible. Blast radius: 1 student.

## Status: OPEN — ACTIONABLE NOW (34d remaining). ~26 school days lost. Fix NOT RUN.
Last checked: 2026-08-15 UTC (79th check)