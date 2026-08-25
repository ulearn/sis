# Issue 38 — Aug Bank Holiday + Course Start Dates (addendum 2 Aug 2026 — run F)

Reporter: PG | Area: Holidays, Bookings etc. | Sheet row 40

## CRITICAL — Window closes tonight (Mon 3 Aug 09:00 WEST)

59th check, 9th today (Sun 2 Aug 2026 UTC).

## Status
- school_closures: ZERO entries Jul-Sep 2026. Aug Bank Holiday (Mon 2026-08-03) STILL absent.
- 21 active BCs start 2026-08-03 (unchanged since last check)
- Booking 18225 DUPLICATE BCs: 25002 + 25003 (same name/dates/booking, both active=true)

## BCs starting Aug 3 (IDs to shunt to Aug 4)
88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24984,
24999, 25002, 25010, 25016, 25028, 25029, 25030, 25033, 25035 (+ 25003 DUPLICATE — deactivate first)

## Fix recipe (NOT YET RUN)

Step 1 — Insert Aug Bank Holiday into school_closures:
  INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Public Holiday', true, NOW());

Step 2 — Deactivate duplicate BC 25003:
  UPDATE booking_courses SET active=false WHERE id=25003;

Step 3 — Shunt 20 BCs from Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date='2026-08-04'
  WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24984,
               24999,25002,25010,25016,25028,25029,25030,25033,25035)
  AND start_date='2026-08-03' AND active=true;
  -- Expected: 20 rows updated

Step 4 — Verify: SELECT id, name, start_date FROM booking_courses
  WHERE start_date IN ('2026-08-03','2026-08-04') AND active=true ORDER BY start_date,id;

## Risk: bookings/data-hygiene | reversible | 20 students first class Aug3->Aug4 (correct for BH)
## Status: URGENT. Fix NOT RUN. Last checked: 2026-08-02 UTC run F