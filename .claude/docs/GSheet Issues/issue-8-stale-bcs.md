# Issue 8 — ILEP Cert Stale Booking Courses (Consolidated Recipe)

Reporter: AC | Area: Doc Gen/Certs | Sheet row: 9 | Last checked: 2026-08-21 UTC (35th check)

## Symptom
Cannot generate certs for Diego Alves da Silva Molina, Pedro De Pauli Pastre,
and Aurora Madril Oliveira Molina. ILEP codes incorrect; cert editor blocks manual edit.

## Root cause
7 Booking Courses remain active past end dates for Diego, Aurora, and Cibele.
Stale active BCs confuse the cert generator (finds multiple active courses).

## Pedro De Pauli Pastre BCs (not yet identified)
Run: SELECT bc.id,bc.name,bc.end_date,bc.active,bc.ilep_code FROM booking_courses bc
JOIN bookings b ON bc.booking_id=b.id JOIN students s ON b.student_id=s.id
WHERE s.first_name='Pedro' AND s.last_name ILIKE 'De Pauli%';

## Current state (2026-08-21)
BC 1482 | Diego | Acad Year Afternoon | end 2025-12-19 | 245d stale | 0 SCAs | ILEP 0318/0003
BC 1483 | Diego | Acad Year Afternoon | end 2026-02-13 | 188d stale | 0 SCAs | ILEP 0318/0003
BC 1484 | Diego | Acad Year Afternoon | end 2026-06-05 | 77d stale  | 1 SCA  | ILEP 0318/0021 *NEW*
BC 1485 | Aurora| Acad Year Afternoon | end 2025-12-19 | 245d stale | 0 SCAs | ILEP 0318/0003
BC 1486 | Aurora| Acad Year Afternoon | end 2026-02-13 | 188d stale | 0 SCAs | ILEP 0318/0003
BC 1487 | Aurora| Acad Year Afternoon | end 2026-06-05 | 77d stale  | 2 SCAs | ILEP 0318/0003
BC 1488 | Cibele| Afternoon General   | end 2025-09-19 | 336d stale | 0 SCAs | (none)

## Fix recipe (NOT YET RUN)

Step 1 — Verify BCs 1484+1487 SCAs are historical (all within course period):
  SELECT id,week_start,week_end FROM student_class_assignments
  WHERE booking_course_id IN (1484,1487) ORDER BY week_start;

Step 2 — Deactivate 5 zero-SCA BCs (safe):
  UPDATE booking_courses SET active=false WHERE id IN (1482,1483,1485,1486,1488);

Step 3 — Deactivate 1484+1487 after Step 1 verification:
  UPDATE booking_courses SET active=false WHERE id IN (1484,1487);

Step 4 — Investigate Pedro BCs (query above), deactivate if stale.

Step 5 — Regenerate certs for Diego and Aurora.

## Risk
Data hygiene. Reversible. Verify SCAs on 1484+1487 first.
BC 1484 newly identified this run — missing from prior recipes.

## Status
Fix NOT RUN. 35th check. 336d max stale.
Last checked: 2026-08-21 UTC