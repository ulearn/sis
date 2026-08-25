# Issue 8 — 17th check Wed 5 Aug 2026

Reporter: various | Area: Doc Gen / Certs | Sheet row: 9

## State — verified 17th check Wed 5 Aug 2026 UTC

8 stale booking courses all still active (unchanged from 4 Aug):

- BC 1482 (Academic Year, ends 2025-12-19): active=true, 0 SCAs — 229 days stale
- BC 1483 (Academic Year Afternoon, ends 2026-02-13): active=true — 173 days stale
- BC 1484 (Academic Year Afternoon, ends 2026-06-05): active=true — 61 days stale
- BC 1485 (Academic Year, ends 2025-12-19): active=true, 0 SCAs — 229 days stale
- BC 1486 (Academic Year Afternoon, ends 2026-02-13): active=true — 173 days stale
- BC 1487 (Academic Year Afternoon, ends 2026-06-05): active=true — 61 days stale
- BC 1602 (Academic Year, ends 2025-12-19): active=true, 0 SCAs — 229 days stale
- BC 1603 (Academic Year Morning, ends 2026-06-05): active=true — 61 days stale

These stale BCs prevent certificate generation for affected students (Diego, Pedro, Aurora).

## Fix Recipe (NOT YET RUN)

Deactivate all 8 stale booking courses. For each:
UPDATE booking_course SET active = false WHERE id IN (1482, 1483, 1484, 1485, 1486, 1487, 1602, 1603);

Risk: data-hygiene. Reversible (set active=true). Blast radius: low (courses already ended).

Status: UNCHANGED — awaiting Neil action. Last checked: Wed 5 Aug 2026 UTC (17th check).
See also: issue-8-addendum-4aug.md for full context.