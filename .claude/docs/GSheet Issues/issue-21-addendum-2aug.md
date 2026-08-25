Issue 21 - BC 1604 stale (11th check)
Reporter: staff | Area: Booking / Class | Sheet row: 22
Student: Maurivan Kuhl (ID 912)

Root cause (2 Aug 2026 UTC - 1st check today)
- Booking course 1604 (Morning General, booking 1461, student 912): active=true, ended 2026-07-03
- 30 days stale (up from 28 days last check)
- Cosmetic staleness only: no payment or class assignment anomaly

Fix recipe - NOT YET RUN

SQL (NOT YET RUN):
UPDATE booking_courses SET active=false WHERE id=1604;

Risk: Data-hygiene. Reversible. 1 BC, 1 student. Cosmetic.
Status: OPEN - fix NOT RUN - Last checked: Sun 2 Aug 2026 UTC (11th check, 1st today, 30d stale)