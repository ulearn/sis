# Issue 38 — Aug Bank Holiday Aug 3 + BC anomalies — 8 Days

Reporter: Various | Area: Holidays / Bookings | Sheet row: 40

## Root cause (verified Sun 26 Jul 2026 UTC)
- Aug 3 Bank Holiday NOT in school_closure (only Good Fridays + Christmas in DB)
- 17 active BCs start Aug 3 (count confirmed: BC88, BC97, BC1755, BC1766, BC24627,
  BC24908, BC24956, BC24958, BC24959, BC24964, BC24970, BC24984, BC24999,
  BC25002, BC25003, BC25010, BC25016)
- BC25016 (Life Pass Morning, bk18238): endDate=2028-08-29 (typo, should be 2026-08-29)
- BC25003 (Gen English AM, bk18225): duplicate of BC25002, same dates Aug 3-Sep 18

## Fix recipe (NOT YET RUN)
1. INSERT school_closure: name=Aug Bank Holiday, start=2026-08-03, end=2026-08-03
2. UPDATE booking_course SET startDate=2026-08-04 WHERE startDate=2026-08-03 AND active=true (expect 17 rows)
3. UPDATE booking_course SET endDate=2026-08-29 WHERE id=25016
4. UPDATE booking_course SET active=false WHERE id=25003
5. Verify no active BCs still start Aug 3

## Risk
Bookings. Aug 3 is 8 days away. 17 students affected. BC25016 typo. BC25003 dup.

## Status
UNRESOLVED — 8 days to Bank Holiday. Fix needed before Aug 3.

Last checked: Sun 26 Jul 2026 UTC (106th hourly run)