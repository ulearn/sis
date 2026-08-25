Issue 19 - BC89+BC90 stale - 30 Jul 2026 UTC
----------------------------------------------
Root cause (unchanged):
- Booking course 89 (Morning IELTS, ended 22 May 2026, booking 83): active=true -- 69 days stale.
- Booking course 90 (Private Lessons, ended 22 May 2026, booking 83): active=true -- 69 days stale.
- Booking 83: CONFIRMED, EUR 2,629.80 / 2,629.80 fully paid, open=0. Cosmetic only.

Fix recipe (NOT YET RUN):
UPDATE booking_course SET active = false WHERE id IN (89, 90);

Risk: data-hygiene; cosmetic; reversible. Status: OPEN - unchanged since 28 Jul 2026.
Last checked: Thu 30 Jul 2026 UTC
