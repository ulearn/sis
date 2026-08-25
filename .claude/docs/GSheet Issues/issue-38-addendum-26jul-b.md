# Issue 38 — Aug 3 Bank Holiday + BC anomalies — 8 Days Away

Reporter: Various | Area: Holidays / Bookings | Sheet row: 40

## Root cause (verified Sun 26 Jul 2026 UTC — run 107)

Aug 3 Bank Holiday missing from school_closure:
- school_closure has only Good Fridays (2026-2030) and Christmas (2026-2029)
- Aug 3 2026 (Bank Holiday) is ABSENT — must be added before Aug 3
- 17 active booking courses start Aug 3 2026 — all need shunting to Aug 4:
  BC88, BC97, BC1755, BC1766, BC24627, BC24908, BC24956, BC24958, BC24959,
  BC24964, BC24970, BC24984, BC24999, BC25002, BC25003, BC25010, BC25016

BC25016 endDate typo:
- BC25016 (Life Pass Morning, booking 18238): endDate = 2028-08-29 (should be 2026-08-29)

BC25003 duplicate:
- BC25003 (booking 18225): duplicate of BC25002, same dates Aug 3-Sep 18

## Fix recipe (NOT YET RUN)

Step 1: INSERT INTO school_closure (name, startDate, endDate)
        VALUES ('Aug Bank Holiday', '2026-08-03', '2026-08-03');

Step 2: UPDATE booking_course SET startDate = '2026-08-04'
        WHERE startDate = '2026-08-03' AND active = true; (expect 17 rows)

Step 3: UPDATE booking_course SET endDate = '2026-08-29' WHERE id = 25016;

Step 4: UPDATE booking_course SET active = false WHERE id = 25003;

Step 5: SELECT COUNT(*) FROM booking_course WHERE startDate = '2026-08-03' AND active = true; (expect 0)

## Risk
Bookings / timetable. Aug 3 is 8 days away. 17 students affected. Reversible.

## Status
UNRESOLVED — Must be fixed before Mon Aug 3. Fix NOT RUN.

Last checked: Sun 26 Jul 2026 UTC (run 107)