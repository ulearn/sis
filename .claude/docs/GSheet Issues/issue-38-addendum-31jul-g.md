ISSUE 38 ADDENDUM — Fri 31 Jul 2026 (19th check) — STILL UNRESOLVED

Reporter: AC | Area: Holidays, Bookings | Sheet row 40

STATUS: LAST BUSINESS DAY — NEW BC ADDED — FIX STILL NOT RUN

NEW SINCE 18TH CHECK: Booking course 25035 (Rakan Alghamdi, General English Academic Year AM Plus,
confirmed=true, ends 2026-12-18) added to Aug 3 start list. Shunt count increases from 13 to 14.

EVIDENCE (live DB, 19th check)

school_closures Jul-Sep 2026: ZERO records. Aug BH (Aug 3) absent — confirmed.

Booking courses starting Aug 3 (active): 21 total (was 20)

14 confirmed to shunt to Aug 4:
  BCs 88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984, 25002, 25010, 25016, 25028, 25035 [NEW]
1 anomaly (BC 24627, CONFIRMED+confirmed=false, Angelica Guerin): shunt to Aug 4
1 duplicate to delete (BC 25003, same as 25002, Aleix Cervera Gonzalez booking 18225)
5 pending: BC 97, BC 24999, BC 25029 (Monica Breier bk18250), BC 25030 (Tayron Sanches bk18251), BC 25033

BC ending Aug 3: BC 25006 (Marina Larripa, booking 18228, General English AM Plus): active, fully paid.
  Neil to decide: move end to 2026-08-01 (last teaching day) or 2026-08-04 (makeup day).

FIX RECIPE (NOT YET RUN)

Step 1: Insert Aug Bank Holiday closure:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES ('August Bank Holiday 2026', '2026-08-03', '2026-08-03', true);

Step 2: Shunt 14 confirmed BCs to Aug 4 (includes new BC 25035):
  UPDATE booking_courses SET start_date = '2026-08-04'
  WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984, 25002, 25010, 25016, 25028, 25035);

Step 3: Shunt BC 24627 (anomaly) to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04' WHERE id = 24627;

Step 4: Delete duplicate BC 25003:
  DELETE FROM booking_courses WHERE id = 25003;

Step 5: Fix BC 25006 end date (Neil chooses):
  UPDATE booking_courses SET end_date = '2026-08-01' WHERE id = 25006;  -- last teaching day before BH
  -- OR: SET end_date = '2026-08-04'  -- makeup day after BH

RISK: bookings — reversible. Blast radius: 15 BCs + 1 deletion + 1 end-date fix.
ILEP BCs: 1766, 24958, 24959, 25016.

STATUS: NOT RUN. 19th check.
TODAY IS THE LAST BUSINESS DAY. Shunt list now has 14 confirmed BCs (added BC 25035).
Run Step 1-4 before EOB today or first thing Monday (Aug 3 = Bank Holiday, school closed).

Last checked: Fri 31 Jul 2026 ~19th hourly run UTC
