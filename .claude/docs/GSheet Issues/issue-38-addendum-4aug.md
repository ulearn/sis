# Issue 38 - Aug BH Shunt (1st check Tue 4 Aug 2026 UTC)
Reporter: NM | Area: Holidays/Bookings | Sheet row: 40

## Root Cause (fresh - 2026-08-04 UTC)
- school_closures: 9 entries (Good Fridays 2026-2030 + Christmas 2026-2029 ONLY). Aug BH 2026-08-03 ABSENT.
- 21 booking courses (active=true) still have start_date=2026-08-03. ALL have 0 class assignments.
- BC 25006 (Marina Larripa, GE AM Plus, ended Aug 3): active=true, 1 day stale.
- Today (Tue Aug 4) is first school day. Shunt to 2026-08-04 valid and needed.

Affected BC ids (21): 88, 97, 1755, 1766, 24627, 24908, 24956 (also Issue 41), 24958, 24959,
24964, 24984, 24999, 25002, 25003, 25010, 25016, 25028, 25029, 25030, 25033, 25035

## Fix Recipe (NOT YET RUN)

Step 1 - Verify count:
  SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true;
  -- Expect: 21

Step 2 - Insert Aug Bank Holiday closure:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday) VALUES ('August Bank Holiday 2026', '2026-08-03', '2026-08-03', true);

Step 3 - Shunt 21 BCs to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04', updated_at = NOW() WHERE start_date = '2026-08-03' AND active = true;

Step 4 - Deactivate BC 25006:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 25006;

Step 5 - Verify:
  SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true; -- Expect: 0

## Risk
Category: bookings, data-hygiene | Reversible: yes | Blast: 21 BCs, 20 students
URGENCY: ACT TODAY - students are at school with no class assignment.

## Status: NOT RUN. Last checked: 2026-08-04 UTC