ISSUE 38 — Aug Bank Holiday fix (URGENT)
=============================================

Area: Holidays/Bookings  Row: 40  Checked: 2026-08-01 UTC (29th hrly, 2nd of day)

SYMPTOM
-------
21 active BCs still start 2026-08-03 (Aug Bank Holiday). Aug BH absent from school_closures.

ROOT CAUSE (confirmed 2026-08-01 UTC, 2nd check)
-------------------------------------------------
- school_closures: 9 entries (Good Fridays 2026-2030 + Christmas 2026-2029). NO Aug BH entry. UNCHANGED.
- Active booking courses starting Aug 3: 21 (15 confirmed=true, 6 confirmed=false). UNCHANGED.
- BC25003: duplicate of BC25002 (booking 18225, s14596 Aleix Cervera, 0 class assignments). Safe to deactivate. UNCHANGED.
- BC25006: ends Aug 3 (started Jul 27, Marina). Last teaching day Fri Aug 1. No shunt needed.

CONFIRMED BCs TO SHUNT Aug 3 → Aug 4 (14)
------------------------------------------
BC88   Africa Mera Bachir s76
BC1755 Maria Giulia Serpi s1019
BC1766 Maria Eduarda Alves Paiva s1028
BC24908 Ai Tsunashima s14546
BC24956 Giampaolo Russo s14571  [also Issue 41]
BC24958 Aurora Madril Oliveira Molina s841
BC24959 Diego Alves da Silva Molina s840
BC24964 Luana Salzano s14576
BC24984 Deva Sofia Onorato s14582
BC25002 Aleix Cervera Gonzalez s14596  [shunt this; deactivate BC25003]
BC25010 Alin Merticariu s14601
BC25016 Anderson da Silva Martins s14607
BC25028 Edgar Gilabert Mata s14615
BC25035 Rakan Alghamdi s14444

UNCONFIRMED BCs STARTING AUG 3 (6 — lower priority)
----------------------------------------------------
BC97 s83 Gustavo Ferreira | BC24627 s14459 Angelica Guerin | BC24999 s14594 Soumaya Bourguiba
BC25029 s979 Monica Breier | BC25030 s14616 Tayron Sanches Feijo | BC25033 s14608 Jingyi Yang

FIX RECIPE (NOT YET RUN)
------------------------

Step 1 — Insert Aug BH closure (NOT YET RUN):
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW());

Step 2 — Deactivate duplicate BC25003 (0 SCAs confirmed safe):
  SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 25003;
  UPDATE booking_course SET active = false WHERE id = 25003;

Step 3 — Shunt 14 confirmed BCs: Aug 3 → Aug 4 (NOT YET RUN):
  UPDATE booking_course
  SET start_date = '2026-08-04'
  WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984, 25002, 25010, 25016, 25028, 25035)
    AND start_date = '2026-08-03' AND active = true;
  -- Expected: 14 rows affected

Step 4 — Shunt 6 unconfirmed BCs (optional, NOT YET RUN):
  UPDATE booking_course
  SET start_date = '2026-08-04'
  WHERE id IN (97, 24627, 24999, 25029, 25030, 25033)
    AND start_date = '2026-08-03' AND active = true;

Step 5 — Verify:
  SELECT id, start_date FROM booking_course WHERE start_date = '2026-08-03' AND active = true;
  -- Expected: 0 rows
  SELECT start_date, name FROM school_closures WHERE start_date = '2026-08-03';
  -- Expected: 1 row

RISK
----
Category: bookings/scheduling. Reversible: yes. Blast radius: 20 BCs (1-day shift). BC25003: 0 SCAs, safe.

STATUS: OPEN — URGENT (window closes tonight)
Aug 3 (Monday) is the Aug Bank Holiday. School is CLOSED. Fix needed before Monday morning.
Last checked: 2026-08-01 UTC (2nd check of day)