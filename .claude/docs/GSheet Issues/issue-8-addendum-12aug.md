# Issue 8 - Stale Booking Courses (ILEP Cert Students)
Reporter: AC | Area: Doc Gen / Certs | Sheet row: 9 | 26th check Wed 12 Aug 2026 UTC

Symptom: Unable to generate certs for Diego Alves da Silva Molina, Pedro De Pauli Pastre, Aurora Madril Oliveira Molina.
Multiple stale Booking Courses block cert generation.

Root Cause (26th check - unchanged):
6 Booking Courses still active past their end dates:
- BC 1482 (Academic Year Afternoon): ended 2025-12-19, 236 days stale, 0 class assignments
- BC 1483 (Academic Year Afternoon): ended 2026-02-13, 180 days stale, 0 class assignments
- BC 1485 (Academic Year Afternoon): ended 2025-12-19, 236 days stale, 0 class assignments
- BC 1486 (Academic Year Afternoon): ended 2026-02-13, 180 days stale, 0 class assignments
- BC 1487 (Academic Year Afternoon): ended 2026-06-05,  68 days stale, 2 class assignments (verify first)
- BC 1488 (Afternoon General):       ended 2025-09-19, 327 days stale, 0 class assignments

Fix Recipe (NOT YET RUN):

Step 1 - Deactivate BCs with 0 class assignments (safe):
  UPDATE booking_courses SET active = false WHERE id IN (1482, 1483, 1485, 1486, 1488);

Step 2 - BC 1487 (2 class assignments - verify before deactivating):
Check students associated with BC 1487 for pending cert work. If safe:
  UPDATE booking_courses SET active = false WHERE id = 1487;

Step 3 - Regenerate certs for Diego, Pedro, Aurora once stale BCs are deactivated.

Risk / Category:
- Category: documents / data-hygiene
- Reversible: yes (SET active = true to undo)
- Blast radius: 6 Booking Courses, 3 students cert generation

Status: OPEN - unchanged 26 consecutive checks. Fix NOT RUN.
Last checked: Wed 12 Aug 2026 UTC (26th check)