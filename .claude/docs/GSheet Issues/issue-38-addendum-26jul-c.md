# Issue 38 — Aug 3 Bank Holiday + BC Anomalies (Addendum 26 Jul 2026 C)

Reporter: Various | Area: Holidays / Bookings | Sheet row: 40

## Root cause (verified Sun 26 Jul 2026 UTC — run 109)

Aug 3 Bank Holiday absent from school_closure:
- school_closure has no entry for 2026-08-03; Good Fridays and Christmas only
- 17 active booking courses start Aug 3 2026 — all must shunt to Aug 4:
  BC88, BC97, BC1755, BC1766, BC24627, BC24908, BC24956, BC24958, BC24959,
  BC24964, BC24970, BC24984, BC24999, BC25002, BC25003, BC25010, BC25016
- 8 calendar days remain (6 working days) before Aug 3

BC25016 end-date typo:
- BC25016 (Life Pass Morning, booking 18238): startDate = 2026-08-03, endDate = 2028-08-29 (wrong year — should be 2026-08-29)

BC25003 possible duplicate:
- BC25003 (General English AM, booking 18225, Aleix Cervera Gonzalez): Aug 3–Sep 18
- BC25002 on same booking appears to overlap; manual review needed before deactivating

## Fix recipe (NOT YET RUN — must run before Aug 3)

Step 1: INSERT INTO school_closure (name, "startDate", "endDate") VALUES ('Aug Bank Holiday', '2026-08-03', '2026-08-03');
Step 2: UPDATE booking_course SET "startDate" = '2026-08-04' WHERE "startDate" = '2026-08-03' AND active = true; -- expect 17 rows
Step 3: UPDATE booking_course SET "endDate" = '2026-08-29' WHERE id = 25016;
Step 4: Review BC25003 vs BC25002 on booking 18225; if dup: UPDATE booking_course SET active = false WHERE id = 25003;
Step 5: SELECT COUNT(*) FROM booking_course WHERE "startDate" = '2026-08-03' AND active = true; -- expect 0

## Risk
bookings / timetable; reversible; 17 students; MUST run before Mon Aug 3

## Status
UNRESOLVED — Aug BH still missing. Fix NOT RUN. 8 days remain. Last checked: Sun 26 Jul 2026 UTC (run 109)
