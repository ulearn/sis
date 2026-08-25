# Issue 8 — Stale ILEP Booking Courses (addendum 4 Aug 2026)
Reporter: AC | Area: Doc Gen / Certs | Sheet row: 9

## Symptom
ILEP course codes incorrect on certs; 8 booking courses still active after course end.

## Root cause
16th consecutive check (Tue 4 Aug 2026 UTC) — all 8 stale booking courses unchanged.

BC 1482 bk1386 ended 2025-12-19: 228d stale
BC 1483 bk1386 ended 2026-02-13: 172d stale
BC 1484 bk1386 ended 2026-06-05: 60d stale
BC 1485 bk1387 ended 2025-12-19: 228d stale
BC 1486 bk1387 ended 2026-02-13: 172d stale
BC 1487 bk1387 ended 2026-06-05: 60d stale
BC 1602 bk1460 ended 2025-12-19: 228d stale
BC 1603 bk1460 ended 2026-06-05: 60d stale

Full diagnosis in issue-8-addendum-2aug.md.
## Fix recipe (NOT YET RUN)
Run in SIS psql:
  UPDATE booking_course SET active = false
  WHERE id IN (1482, 1483, 1484, 1485, 1486, 1487, 1602, 1603);
After deactivation regenerate certs for Diego/Pedro/Aurora via SIS admin.
## Risk / category
bookings | data-hygiene. Reversible. Blast radius: 3 students.
## Status
Open — 228 days max staleness. Fix NOT RUN.
## Last checked (UTC)
Tue 4 Aug 2026