# Issue 38 — Aug 3 Bank Holiday + BC Anomalies (Addendum 26 Jul 2026 E)

Reporter: Various | Area: Holidays / Bookings | Sheet row: 40

## Root cause (verified Sun 26 Jul 2026 UTC — run 111)

Aug 3 Bank Holiday absent from school_closures:
- school_closures table has no entry covering 2026-08-03; only Good Fridays and Christmas present
- 17 active booking courses start 2026-08-03 — all must shunt to 2026-08-04
- 8 calendar days remain before Aug 3 (fix by Fri Jul 31 at latest)

BC25016 end-date typo:
- BC25016 (Life Pass Morning, booking 18238): start_date = 2026-08-03, end_date = 2028-08-29 (wrong year — should be 2026-08-29)

BC25003 possible duplicate:
- BC25003 (General English AM, booking 18225, Aleix Cervera Gonzalez): Aug 3–Sep 18 2026, active = true
- BC25002 on same booking has identical name and dates — manual review needed before deactivating BC25003

Column note: school_closures uses snake_case (start_date, end_date); booking_courses same.

## Fix recipe (NOT YET RUN — must run before Aug 3)

Step 1: Add Aug 3 Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date) VALUES ('Aug Bank Holiday', '2026-08-03', '2026-08-03');

Step 2: Shunt all 17 active booking courses from Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04' WHERE start_date = '2026-08-03' AND active = true;
  -- Expect 17 rows updated

Step 3: Fix BC25016 end-date typo:
  UPDATE booking_courses SET end_date = '2026-08-29' WHERE id = 25016;

Step 4: Review BC25003 vs BC25002 on booking 18225:
  SELECT id, name, start_date, end_date, active FROM booking_courses WHERE booking_id = 18225;
  -- If BC25003 is a true duplicate: UPDATE booking_courses SET active = false WHERE id = 25003;

Step 5: Verify no active BCs remain on Aug 3:
  SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true;
  -- Expect 0

## Risk
bookings / timetable; reversible; 17 students affected; MUST run before Mon Aug 3

## Status
UNRESOLVED — Aug BH still missing from school_closures. Fix NOT RUN. 8 days remain. Last checked: Sun 26 Jul 2026 UTC (run 111)