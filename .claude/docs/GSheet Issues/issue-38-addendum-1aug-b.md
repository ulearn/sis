ISSUE 38 — Aug Bank Holiday fix (URGENT — FINAL WINDOW)
=========================================================

Area: Holidays/Bookings  Row: 40  Checked: 2026-08-01 UTC (31st hrly, 4th of day)

SYMPTOM
-------
21 active booking courses still start 2026-08-03 (Aug Bank Holiday). Aug BH absent from school_closures.

ROOT CAUSE (confirmed 2026-08-01 UTC, 4th check of day — UNCHANGED)
----------------------------------------------------------------------
- school_closures: 9 entries (Good Fridays 2026-2030 + Christmas 2026-2029). NO Aug BH entry.
- Active booking courses starting Aug 3: 21 (15 confirmed=true, 6 confirmed=false). UNCHANGED.
- BC25003: duplicate of BC25002 (booking 18225, Aleix Cervera Gonzalez). 0 class assignments. Safe to deactivate.
- Window closes tonight — fix must run before midnight Sat 1 Aug or students show up on a Bank Holiday.

CONFIRMED BCs TO SHUNT Aug 3 -> Aug 4 (15 confirmed CONFIRMED+true)
--------------------------------------------------------------------
BC88    Africa Mera Bachir s76
BC1755  Maria Giulia Serpi s1019
BC1766  Maria Eduarda Alves Paiva s1028
BC24908 Ai Tsunashima s14546
BC24956 Giampaolo Russo s14571   [also Issue 41 - arrives tomorrow]
BC24958 Aurora Madril Oliveira Molina s841
BC24959 Diego Alves da Silva Molina s840
BC24964 Luana Salzano s14576
BC24984 Deva Sofia Onorato s14582
BC25002 Aleix Cervera Gonzalez s14596  [shunt; deactivate BC25003]
BC25010 Alin Merticariu s14601
BC25016 Anderson da Silva Martins s14607
BC25028 Edgar Gilabert Mata s14615
BC25035 Rakan Alghamdi s14444

UNCONFIRMED BCs STARTING AUG 3 (6 - lower priority, shunt anyway)
------------------------------------------------------------------
BC97    Gustavo Ferreira s83
BC24627 Angelica Guerin s14459
BC24999 Soumaya Bourguiba s14594
BC25029 Monica Breier Fiametti s979
BC25030 Tayron Sanches Feijo Filho s14616
BC25033 Jingyi Yang s14608

FIX RECIPE (NOT YET RUN)
------------------------

Step 1 - Insert Aug BH school closure (NOT YET RUN):
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW());

Step 2 - Deactivate duplicate BC25003 (NOT YET RUN):
  SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 25003;
  UPDATE booking_course SET active = false WHERE id = 25003;

Step 3 - Shunt 14 confirmed BCs: Aug 3 -> Aug 4 (NOT YET RUN):
  UPDATE booking_course
  SET start_date = '2026-08-04'
  WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984, 25002, 25010, 25016, 25028, 25035)
    AND start_date = '2026-08-03' AND active = true;
  -- Expected: 14 rows affected

Step 4 - Shunt 6 unconfirmed BCs (NOT YET RUN):
  UPDATE booking_course
  SET start_date = '2026-08-04'
  WHERE id IN (97, 24627, 24999, 25029, 25030, 25033)
    AND start_date = '2026-08-03' AND active = true;

Step 5 - Verify (NOT YET RUN):
  SELECT id, name, start_date FROM booking_course WHERE start_date = '2026-08-03' AND active = true;
  -- Expected: 0 rows
  SELECT id, name, start_date FROM school_closures WHERE start_date = '2026-08-03';
  -- Expected: 1 row

RISK
----
Category: bookings/scheduling. Reversible: yes. Blast radius: 21 BCs (1-day shift). BC25003: 0 SCAs, safe.

STATUS: OPEN - URGENT (window closes tonight Sat 1 Aug)
Aug 3 (Monday) = August Bank Holiday Ireland. School CLOSED. Fix needed TONIGHT.
Last checked: 2026-08-01 UTC (31st check, 4th of day)
