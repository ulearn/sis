Issue 45 — Renewal Students Arrivals — BC 25011 Stale (114th check, 29 Jul 2026)

Reporter: AC | Area: Renewal students | Sheet row: 47

Symptom
=======
Returning students not appearing on arrivals list. One stale booking course remains active after it ended.

Root cause (DB, 29 Jul 2026 UTC)
=================================
- Booking course 25011 (General English PM, bk 18233, student 14602 Eduardo Roche Diaz):
  active=true, start=2026-07-20, end=2026-07-24.
- BC 25011 ended 5 calendar days ago (Jul 24) — still active=true.
- Class assignment window permanently closed (Jul 20-24 week complete).
- Attendance for Jul 20-24 is irrecoverable. Fix is data hygiene only.
- Hash change this run = formatting artefact in sheet G (content unchanged).

Fix recipe — NOT YET RUN
=========================

Step 1 — Deactivate BC 25011
NOT YET RUN:
  UPDATE booking_courses SET active = false, updated_at = NOW()
  WHERE id = 25011 AND end_date = '2026-07-24';

Step 2 — Verify
NOT YET RUN:
  SELECT id, name, start_date, end_date, active FROM booking_courses WHERE id = 25011;
  Should show active=false.

Risk / category
===============
Data hygiene. Minimal; reversible.
No student impact (course already ended Jul 24).

Status
======
OPEN (data hygiene) — Fix NOT RUN. 114th check 29 Jul 2026 UTC.
Hash artefact (sheet formatting only; no DB change). Low priority.

Last checked
============
2026-07-29 UTC
