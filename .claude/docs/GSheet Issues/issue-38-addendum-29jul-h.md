Issue 38 -- Aug Bank Holiday 2026 (162nd check, 29 Jul 2026)

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

Symptom
=======
August Bank Holiday (Mon 2026-08-03) absent from school_closures.
20 active booking courses start on that date and will not be shunted.

Root cause (DB, 29 Jul 2026 UTC -- 162nd hourly check)
=======================================================
- school_closures: 9 records (Good Fridays 2026-2030, Christmas 2026-2029). No Aug 3 entry. UNCHANGED.
- 20 active booking courses start on 2026-08-03. UNCHANGED.
- BC 25006 (Marina Larripa, booking 18228): end_date = 2026-08-03 -- needs extending to 2026-08-04.
- BC 25003 (Aleix Cervera, booking 18225): duplicate of BC 25002 (same dates Aug3-Sep18, different fee). Deactivate -- do not shunt.
- BC 25002 fee = 259.2 (partial/original), BC 25003 fee = 688 (full). Both same booking. Deactivate 25003 -- it was manually created in error.
- DEADLINE: Fri 31 Jul 2026. Must act by Thu 30 Jul EOD (TOMORROW).

20 booking courses starting 2026-08-03 (shunt 19 to 2026-08-04; deactivate BC 25003)
=======================================================================================
BC 88    | Morning General         | bk 82    | ends 2026-08-07
BC 97    | Academic Year Morning   | bk 89    | ends 2026-12-18
BC 1755  | Morning General         | bk 1571  | ends 2026-08-14
BC 1766  | AY Renewal Morning      | bk 1581  | ends 2026-09-04
BC 24627 | Morning General         | bk 17853 | ends 2026-08-14
BC 24908 | General English AM      | bk 18128 | ends 2026-08-21
BC 24956 | General English AM      | bk 18180 | ends 2026-09-11  (also Issue 41)
BC 24958 | Academic Year Morning   | bk 18182 | ends 2027-02-05
BC 24959 | Academic Year Morning   | bk 18183 | ends 2027-02-05
BC 24964 | General English AM Plus | bk 18188 | ends 2026-08-14
BC 24970 | Academic Year Afternoon | bk 18194 | ends 2027-02-05
BC 24984 | Intensive GE and IELTS  | bk 18207 | ends 2026-08-25
BC 24999 | General English PM      | bk 18222 | ends 2026-08-29
BC 25002 | General English AM      | bk 18225 | ends 2026-09-18  (shunt this one)
BC 25003 | General English AM      | bk 18225 | ends 2026-09-18  DUPLICATE -> DEACTIVATE, do not shunt
BC 25010 | General English AM      | bk 18232 | ends 2026-08-28
BC 25016 | Life Pass Morning       | bk 18238 | ends 2027-01-22
BC 25028 | Intensive GE            | bk 18249 | ends 2026-08-28
BC 25029 | Academic Year Morning   | bk 18250 | ends 2026-11-13
BC 25030 | General English PM      | bk 18251 | ends 2026-08-28

Fix recipe -- NOT YET RUN
=========================

Step 1 -- Insert August Bank Holiday school closure
NOT YET RUN:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW());

Step 2 -- Shunt 19 booking courses to 2026-08-04 (exclude BC 25003 duplicate)
NOT YET RUN:
  UPDATE booking_courses
  SET start_date = '2026-08-04', updated_at = NOW()
  WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25010,25016,25028,25029,25030)
    AND active = true AND start_date = '2026-08-03';
  Verify (expect 0 rows):
  SELECT id FROM booking_courses
  WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25010,25016,25028,25029,25030) AND start_date = '2026-08-03';

Step 3 -- Extend BC 25006 end date (Marina Larripa, booking 18228)
NOT YET RUN:
  UPDATE booking_courses SET end_date = '2026-08-04', updated_at = NOW()
  WHERE id = 25006 AND end_date = '2026-08-03';

Step 4 -- Deactivate duplicate BC 25003 (Aleix Cervera, booking 18225)
NOT YET RUN:
  UPDATE booking_courses SET active = false, updated_at = NOW()
  WHERE id = 25003 AND booking_id = 18225;
  Verify: SELECT id, active, fee FROM booking_courses WHERE booking_id = 18225;

Risk / category
===============
Bookings -- medium blast radius; fully reversible.
BC 25003 deactivation safe (duplicate row; BC 25002 is canonical).

Status
======
OPEN -- Fix NOT RUN. 162nd check 29 Jul 2026 UTC.
DEADLINE: Fri 31 Jul 2026 -- act by Thu 30 Jul EOD (TOMORROW).

Last checked
============
2026-07-29 UTC