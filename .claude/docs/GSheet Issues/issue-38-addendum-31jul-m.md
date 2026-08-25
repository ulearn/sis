Issue 38 Addendum  31 Jul 2026 (m)  FINAL WINDOW: Aug BH Shunt
Reporter: Staff / Neil  Area: Holidays, Bookings  Sheet row: 40
Last checked: 2026-07-31 UTC (27th hourly check, 9th today)

SYMPTOM
August Bank Holiday 2026-08-03 absent from school_closures.
21 active booking courses start on that date and will begin on a BH if not fixed before Monday.

ROOT CAUSE (live DB evidence)
- school_closures: NO entry for 2026-08-03 (full table confirmed this run; 9 entries exist: Good Fridays + Christmas 2026-2030 only).
- 21 booking_courses with start_date = 2026-08-03 and active = true (count stable, unchanged across all prior checks).

Confirmed bookings -- shunt start to 2026-08-04 (14 courses)
  BC 88    -- Africa Mera Bachir (s76, bk82) -- Morning General
  BC 1755  -- Maria Giulia Serpi (s1019, bk1571) -- Morning General
  BC 1766  -- Maria Eduarda Alves Paiva (s1028, bk1581) -- AY Renewal Morning
  BC 24908 -- Ai Tsunashima (s14546, bk18128) -- General English AM
  BC 24956 -- Giampaolo Russo (s14571, bk18180) -- General English AM (also in Issue 41)
  BC 24958 -- Aurora Madril Oliveira Molina (s841, bk18182) -- AY Morning
  BC 24959 -- Diego Alves da Silva Molina (s840, bk18183) -- AY Morning
  BC 24964 -- Luana Salzano (s14576, bk18188) -- General English AM Plus
  BC 24984 -- Deva Sofia Onorato (s14582, bk18207) -- Intensive GE & IELTS
  BC 25002 -- Aleix Cervera Gonzalez (s14596, bk18225) -- General English AM
  BC 25010 -- Alin Merticariu (s14601, bk18232) -- General English AM
  BC 25016 -- Anderson da Silva Martins (s14607, bk18238) -- Life Pass Morning
  BC 25028 -- Edgar Gilabert Mata (s14615, bk18249) -- Intensive General English
  BC 25035 -- Rakan Alghamdi (s14444, bk17915) -- GE Academic Year AM Plus

DELETE (not shunt): BC 25003 = DUPLICATE of BC 25002 (same student 14596, booking 18225, same dates Aug 3-Sep 18).

Unconfirmed bookings -- shunt only if also confirming (6 courses)
  BC 97    -- Gustavo Ferreira (s83, bk89)
  BC 24627 -- Angelica Guerin (s14459, bk17853)
  BC 24999 -- Soumaya Bourguiba (s14594, bk18222)
  BC 25029 -- Monica Breier Fiametti (s979, bk18250)
  BC 25030 -- Tayron Sanches Feijo Filho (s14616, bk18251)
  BC 25033 -- Jingyi Yang (s14608, bk18254)

BC 25006 -- ends Aug 3 (low priority note)
BC 25006 (bk18228, Jul 27-Aug 3, active=true) ends ON the BH. Last teaching day was Aug 1 (Fri).
Optional: UPDATE booking_courses SET end_date = 2026-08-01 WHERE id = 25006;

FIX RECIPE (NOT YET RUN)

Step 1 -- Insert August Bank Holiday into school_closures
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, note)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, 'Ireland August Bank Holiday 2026');

Step 2 -- Deactivate duplicate BC 25003
  Verify zero SCAs: SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 25003;
  If 0: UPDATE booking_courses SET active = false WHERE id = 25003;

Step 3 -- Shunt 14 confirmed BCs from Aug 3 to Aug 4
  UPDATE booking_courses
  SET start_date = '2026-08-04'
  WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984,
               25002, 25010, 25016, 25028, 25035)
    AND start_date = '2026-08-03'
    AND active = true;

Step 4 -- Shunt 6 unconfirmed BCs (optional, only if confirming)
  UPDATE booking_courses
  SET start_date = '2026-08-04'
  WHERE id IN (97, 24627, 24999, 25029, 25030, 25033)
    AND start_date = '2026-08-03'
    AND active = true;

RISK / CATEGORY
- Category: bookings / holidays
- Reversible: yes -- revert dates; school_closure can be deleted if wrong
- Blast radius: 21 students. Closure INSERT is additive (safe). Shunts are simple date updates.
  BC 25003 deactivation is the only destructive step (verify 0 SCAs first).
- DEADLINE: Must run before Monday 3 Aug 2026. Last window: tonight (Fri 31 Jul) or Saturday 1 Aug.

STATUS
NOT RUN. 27th hourly check (9th today, Fri 31 Jul 2026).
Aug BH still absent from DB. 21 BCs still start Aug 3. URGENT -- last window.