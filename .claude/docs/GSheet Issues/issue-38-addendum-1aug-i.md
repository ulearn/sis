# Issue 38 — August Bank Holiday 2026-08-03

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40 | Check: 45th (18th Sat 1 Aug 2026 UTC)

## Symptom
August Bank Holiday 2026-08-03 absent from school_closures; 21 active booking courses start on that date.

## Root Cause (confirmed — NOT YET FIXED)
9 school_closures entries: Good Fridays 2026-2030 + Christmas 2026-2029. No Aug Bank Holiday entry.
Fresh DB check Sat 1 Aug 2026: still 21 active BCs starting 2026-08-03.

Affected booking courses starting 2026-08-03:
BC 88 (bk 82), BC 97 (bk 89), BC 1755 (bk 1571), BC 1766 (bk 1581), BC 24627 (bk 17853),
BC 24908 (bk 18128), BC 24956 (bk 18180 - Giampaolo Russo, Issue 41), BC 24958 (bk 18182),
BC 24959 (bk 18183), BC 24964 (bk 18188), BC 24984 (bk 18207), BC 24999 (bk 18222),
BC 25002 (bk 18225), BC 25003 (bk 18225 - DUPLICATE, deactivate), BC 25010 (bk 18232),
BC 25016 (bk 18238), BC 25028 (bk 18249), BC 25029 (bk 18250), BC 25030 (bk 18251),
BC 25033 (bk 18254), BC 25035 (bk 17915).

## Fix Recipe (NOT YET RUN)

Step 1 - Insert Aug BH school closure:
  INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Irish August Bank Holiday 2026', true, NOW());

Step 2 - Shunt all 21 BCs from Aug 3 -> Aug 4 (+1 day end):
  UPDATE booking_courses
  SET start_date = '2026-08-04', end_date = end_date + INTERVAL '1 day'
  WHERE id IN (88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959,
               24964, 24984, 24999, 25002, 25003, 25010, 25016, 25028,
               25029, 25030, 25033, 25035);

Step 3 - Deactivate duplicate BC 25003 (Aleix Cervera has 25002 as correct BC):
  UPDATE booking_courses SET active = false WHERE id = 25003;

Step 4 - Verify:
  SELECT id, start_date, end_date, active FROM booking_courses
  WHERE id IN (88, 24956, 25002, 25003) ORDER BY id;
  -- Expected: all show 2026-08-04 start except 25003 (active=false)

## Risk / Category
- Category: bookings/holidays
- Reversible: yes (invert: SET start_date=2026-08-03, end_date=end_date - INTERVAL 1 day)
- Blast radius: 21 booking courses, ~20 students
- Issue 41 dependency: BC 24956 (Giampaolo Russo, check-in Aug 2) is in this list

## Status
Open - 45th check (18th today Sat 1 Aug 2026). NOT FIXED.
WINDOW: school opens Mon 2026-08-03 09:00 — must be done by Sunday evening at the latest.

Last checked: 2026-08-01 UTC