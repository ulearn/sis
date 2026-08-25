# Issue 8 Addendum 9 Aug
Reporter: Staff | Row: 9 | Check: 22nd Sun 9 Aug 2026 UTC

## Root Cause - unchanged
6 stale BCs still active:
- BC 1482 (Academic Year Afternoon): ended 19 Dec 2025, 233 days stale, 0 SCAs
- BC 1483 (Academic Year Afternoon): ended 13 Feb 2026, 177 days stale, 0 SCAs
- BC 1485 (Academic Year Afternoon): ended 19 Dec 2025, 233 days stale, 0 SCAs
- BC 1486 (Academic Year Afternoon): ended 13 Feb 2026, 177 days stale, 0 SCAs
- BC 1602 (Academic Year Morning): ended 19 Dec 2025, 233 days stale, 0 SCAs
- BC 1603 (Academic Year Morning): ended 5 Jun 2026, 65 days stale, 2 historical SCAs

Note: BC 1607 (ends 27 Nov 2026) is CURRENT, do NOT deactivate.

## Fix Recipe (NOT YET RUN)
UPDATE booking_courses SET active = false WHERE id IN (1482, 1483, 1485, 1486, 1602, 1603);

Then regenerate certs for Diego Alves da Silva Molina, Pedro De Pauli Pastre, Aurora Madril Oliveira Molina via SIS admin.

## Risk: Docs / data hygiene. Reversible. 3 students, 6 BCs.
## Status: Open. NOT RUN. 6 stale BCs (233d max).
## Last Checked: Sun 9 Aug 2026 UTC (22nd check)