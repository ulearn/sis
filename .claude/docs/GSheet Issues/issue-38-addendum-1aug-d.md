# Issue 38 - August Bank Holiday 2026-08-03

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40 | Check: 39th (12th Sat 1 Aug 2026 UTC)

## Symptom
August Bank Holiday 2026-08-03 absent from school_closures; system cannot auto-shunt 21 affected booking courses to 2026-08-04.

## Root Cause (fresh DB -- NOT YET FIXED)

school_closures has 9 entries: Good Fridays 2026-2030 and Christmas 2026-2029. NO August Bank Holiday entry.

21 active booking courses with start_date = 2026-08-03:

Confirmed = true (15 BCs):
BC 88 (Morning General, ends Aug 7)
BC 1755 (Morning General, ends Aug 14)
BC 1766 (AY Renewal Morning, ends Sep 4)
BC 24908 (General English AM, ends Aug 21)
BC 24956 (General English AM - Giampaolo Russo Issue 41 - ends Sep 11)
BC 24958 (AY Morning, ends Feb 5 2027)
BC 24959 (AY Morning, ends Feb 5 2027)
BC 24964 (GE AM Plus, ends Aug 14)
BC 24984 (Intensive GE & IELTS, ends Aug 25)
BC 25002 (GE AM - Aleix Cervera Gonzalez - ends Sep 18)
BC 25003 (GE AM - Aleix Cervera - DUPLICATE of BC 25002 - ends Sep 18)
BC 25010 (GE AM, ends Aug 28)
BC 25016 (Life Pass Morning, ends Jan 22 2027)
BC 25028 (Intensive GE, ends Aug 28)
BC 25035 (GE AY AM Plus, ends Dec 18 2026)

Confirmed = false / pending / partial (6 BCs):
BC 97 (AY Morning PENDING ends Dec 18)
BC 24627 (Morning General CONFIRMED ends Aug 14)
BC 24999 (GE PM PENDING ends Aug 29)
BC 25029 (AY Morning PENDING ends Nov 13)
BC 25030 (GE PM PARTIAL ends Aug 28)
BC 25033 (GE PM PENDING ends Aug 28)

BC 25003 is a confirmed duplicate: booking_id=18225, identical name/dates to BC 25002 (both Aleix Cervera Gonzalez).

## Fix Recipe (NOT YET RUN)

Step 1 - Insert August Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Irish August Bank Holiday 2026', true, NOW());

Step 2 - Shunt 21 BCs: move start_date Aug 3 to Aug 4, extend end_date +1 day:
  UPDATE booking_courses
  SET start_date = '2026-08-04', end_date = end_date + INTERVAL '1 day'
  WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984,
               25002, 25003, 25010, 25016, 25028, 25035,
               97, 24627, 24999, 25029, 25030, 25033);

CAUTION: BC 25003 is duplicate of BC 25002. Deactivate BC 25003 after shunting.

Step 3 - Deactivate duplicate BC 25003:
  UPDATE booking_courses SET active = false WHERE id = 25003;

Step 4 - Verify:
  SELECT id, name, start_date, end_date, active FROM booking_courses
  WHERE id IN (88, 1755, 24956, 25002, 25003) ORDER BY id;

## Risk
Category: bookings, holidays. Reversible: yes. Blast radius: 21 BCs. Window closes TONIGHT (Aug 1).

## Status
Open -- 39th check (12th today), NOT FIXED. Window closes tonight.
Last checked: 2026-08-01 UTC (12th check today)