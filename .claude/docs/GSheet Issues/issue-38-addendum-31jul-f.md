ISSUE 38 ADDENDUM — Fri 31 Jul 2026 (18th check) — STILL UNRESOLVED

Reporter: AC | Area: Holidays, Bookings | Sheet row 40

STATUS: LAST BUSINESS DAY — FIX STILL NOT RUN
20 booking courses start Aug 3; data matches previous check exactly.

EVIDENCE (live DB, 18th check)

school_closures Jul-Sep 2026: ZERO records. Aug BH (Aug 3) absent.

Booking courses starting Aug 3 (active): 20 total — unchanged

13 confirmed to shunt to Aug 4:
  BCs 88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984, 25002, 25010, 25016, 25028
1 anomaly (BC 24627, CONFIRMED+confirmed=false, Angelica Guerin): shunt to Aug 4
1 duplicate to delete (BC 25003, same as 25002, Aleix Cervera Gonzalez bk 18225)
5 pending: BC 97, BC 24999, BC 25029 (Monica Breier bk18250), BC 25030 (Tayron Sanches bk18251), BC 25033
BC ending Aug 3: BC 25006 (Marina Larripa, bk18228, General English AM Plus): active, fully paid.
  Neil to decide: move end to Aug 1 (last teaching day) or Aug 4 (makeup).

FIX RECIPE (NOT YET RUN)

Step 1: Insert Aug Bank Holiday closure:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES ('August Bank Holiday 2026', '2026-08-03', '2026-08-03', true);

Step 2: Shunt 13 confirmed BCs to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04'
  WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984, 25002, 25010, 25016, 25028);

Step 3: Shunt BC 24627 to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04' WHERE id = 24627;

Step 4: Delete duplicate BC 25003:
  DELETE FROM booking_courses WHERE id = 25003;

Step 5: Fix BC 25006 end date (Neil chooses):
  UPDATE booking_courses SET end_date = '2026-08-01' WHERE id = 25006;  -- last teaching day
  -- OR: SET end_date = '2026-08-04'  -- makeup day

RISK: bookings — reversible. Blast radius: 14 BCs + 1 deletion + 1 end-date fix.
ILEP BCs: 1766, 24958, 24959, 25016.

STATUS: NOT RUN. 18th check — no data change from 17th check.
TODAY IS THE LAST BUSINESS DAY. Run before EOB today or first thing Monday.

Last checked: Fri 31 Jul 2026 ~18th hourly run UTC