# Issue 38 — Aug Bank Holiday (9th check Thu 30 Jul 2026 UTC)

Reporter: PG | Area: Holidays/Bookings | Sheet row: 40

## Root Cause
- school_closures has NO entry for 2026-08-03 (0 rows returned).
- 20 active booking_courses still have start_date=2026-08-03.
  IDs: 88,97,1755,1766,24627,24908,24956,24958,24959,24964,24984,24999,
       25002,25003,25010,25016,25028,25029,25030,25033
- BC 25006 (Marina Larripa): start=2026-07-27, end=2026-08-03, active=true.
  End date is on the BH — needs pushing to 2026-08-04.
- Fix NOT RUN. No change from 30jul-j.

## DEADLINE: TOMORROW — Fri 31 Jul 2026
Students arrive Sat 1 Aug, first class Mon 3 Aug.

## Fix Recipe (NOT YET RUN)

Step 1 — Insert Aug Bank Holiday closure:
  INSERT INTO school_closures (name,start_date,end_date,note,is_paid_holiday,created_at)
  VALUES ('August Bank Holiday','2026-08-03','2026-08-03','School closed',true,NOW());

Step 2 — Shunt 20 start_dates from Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date='2026-08-04', updated_at=NOW()
  WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,
               24984,24999,25002,25003,25010,25016,25028,25029,25030,25033)
    AND active=true AND start_date='2026-08-03';
  -- Verify: SELECT COUNT(*) FROM booking_courses WHERE start_date='2026-08-03' AND active=true; -- expect 0

Step 3 — Push BC 25006 end_date from Aug 3 to Aug 4:
  UPDATE booking_courses SET end_date='2026-08-04', updated_at=NOW()
  WHERE id=25006 AND end_date='2026-08-03';
  -- Verify: SELECT id,start_date,end_date FROM booking_courses WHERE id=25006;

## Risk / Category
Bookings/Holidays — reversible. Blast radius: 21 course records.

## Status
NOT RUN. 9th check Thu 30 Jul 2026 UTC. DEADLINE TOMORROW Fri 31 Jul 2026.