Issue 38 Aug BH Shunt 3 Aug 2026 12th check today 83rd overall

Reporter: NM | Area: Holidays / Bookings | Sheet row: 40

Symptom: School closure for Aug Bank Holiday 2026-08-03 never inserted; 21 booking courses starting today not shunted.

Root cause (confirmed fresh 12th check 3 Aug 2026 UTC):
- school_closures: 0 rows for start_date = 2026-08-03 (absent)
- 21 active booking courses with start_date = 2026-08-03:
  88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24984,
  24999, 25002, 25003, 25010, 25016, 25028, 25029, 25030, 25033, 25035
- BC 25006 (General English AM Plus, booking 18228): end_date=2026-08-03, active=true — deactivate BEFORE shunt
- Total stale booking courses ended on/before Aug 3: 24467 (Issue 45 bulk fix pending)
- Students have not started (bank holiday); shunt still actionable today

Fix recipe (NOT YET RUN):

Step 0 - Deactivate BC 25006 (ends today not part of shunt):
  UPDATE booking_courses SET active = false WHERE id = 25006;

Step 1 - Insert school closure record:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday) VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true);

Step 2 - Shunt 21 BCs push start_date Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04' WHERE start_date = '2026-08-03' AND active = true AND id IN (88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24984, 24999, 25002, 25003, 25010, 25016, 25028, 25029, 25030, 25033, 25035);

Step 3 - Verify:
  SELECT id FROM booking_courses WHERE start_date = '2026-08-03' AND active = true; -- expect 0 rows
  SELECT * FROM school_closures WHERE start_date = '2026-08-03'; -- expect 1 row

Risk: Bookings 21 students reversible blast-radius medium.
After shunt Issue 41 BC 24956 start corrects to Aug 4 and SCA for week Aug 4 can be created.

Status: OPEN - Fix NOT YET RUN
Last checked: Mon 3 Aug 2026 UTC (12th check today, 83rd overall)