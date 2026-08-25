# Issue 38 — August Bank Holiday 2026 Missing

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

## Symptom
August Bank Holiday (Mon 3 Aug 2026) absent from school_closures. 18 active booking courses start Mon 3 Aug and will not be shunted to Tuesday.

## Root Cause (Tue 28 Jul 2026 UTC — 139th check)
schoolClosure table has 9 rows: Good Fridays 2026-2030, Christmas 2026-2029. No entry for Aug Bank Holiday 2026. The shunt system reads from this table; bookingCourses with startDate = 2026-08-03 will not be auto-shunted.

Evidence: 9 closures (IDs 1, 7-14), no Aug BH row. 18 BCs start Mon 3 Aug (was 17 yesterday).

## Fix Recipe (NOT YET RUN)

Step 1 — Insert the closure (raw SQL or Prisma Studio):
INSERT INTO school_closure (name, startDate, endDate, isPaidHoliday, note)
VALUES (August Bank Holiday, 2026-08-03, 2026-08-03, true, August Bank Holiday IE);

Step 2 — Verify (expect 10 rows):
SELECT id, name, startDate, isPaidHoliday FROM school_closure ORDER BY startDate;

Step 3 — Review the 18 affected BCs (startDate=2026-08-03) to check whether end dates need manual +1 day if shunt is not retroactive.

## Risk
Category: bookings/data-integrity | Reversible: yes | Blast radius: 18 BCs

## Status
OPEN — DEADLINE Fri 31 Jul 2026 (must insert before Mon 3 Aug)

## Last Checked
Tue 28 Jul 2026 UTC (139th hourly check)
