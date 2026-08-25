Issue 38 - August Bank Holiday 2026
Reporter: PG | Sheet row: 40
Last checked: 2026-07-30 UTC (165th check) - DEADLINE TODAY

Root cause (NOT YET RUN):
- school_closures: no row for 2026-08-03 confirmed this run
- 20 active BCs start 2026-08-03: IDs 88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25003, 25010, 25016, 25028, 25029, 25030
- BC 25003 (booking 18225, Aleix Cervera): duplicate of BC 25002 - deactivate do NOT shunt
- 19 remaining BCs: shunt start_date Aug 3 to Aug 4
- BC 25006 (booking 18228, General English AM Plus): ends Aug 3 - extend end_date to Aug 4

Fix recipe (NOT YET RUN):
Step 1 - Insert school closure:
  INSERT INTO school_closures (name,start_date,end_date,note,is_paid_holiday) VALUES (August Bank Holiday,2026-08-03,2026-08-03,Ireland public holiday,false);
Step 2 - Shunt 19 BCs Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date=2026-08-04,updated_at=NOW()
  WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25010,25016,25028,25029,25030)
  AND start_date=2026-08-03; -- expect 19 rows
Step 3 - Deactivate duplicate BC 25003:
  UPDATE booking_courses SET active=false,updated_at=NOW() WHERE id=25003;
Step 4 - Extend BC 25006 end date to Aug 4:
  UPDATE booking_courses SET end_date=2026-08-04,updated_at=NOW() WHERE id=25006;
Verify:
  SELECT id,booking_id,name,start_date,end_date,active FROM booking_courses WHERE (start_date=2026-08-03 OR end_date=2026-08-03) AND active=true; -- expect 0 rows

Risk: bookings, data-hygiene. Reversible. Blast radius 20 BCs.
Status: NOT YET RUN - awaiting Neil approval. Last checked: 2026-07-30 UTC.