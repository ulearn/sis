# Issue 38 -- August Bank Holiday 2026 (23rd check / 5th check Fri 31 Jul 2026)

Reporter: PG | Area: Holidays / Bookings | Sheet row: 40

## Symptom
Booking courses assigned to start on August Bank Holiday (Mon Aug 3 2026). School closure absent from DB; 14 confirmed courses need shunting to Aug 4.

## Root cause (verified live, Fri 31 Jul 2026 UTC -- 5th check today)

- school_closures: NO entry for 2026-08-03. Only 2026 closures: Good Friday Apr 3, Christmas Dec 21-Jan 3 2027.
- 21 active booking courses have start_date = 2026-08-03 (unchanged):
  - 14 confirmed=true to shunt to Aug 4: IDs 88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984, 25002, 25010, 25016, 25028, 25035
  - BC 25003 (duplicate of BC 25002, 0 SCAs): delete
  - BC 24627 (Angelica Guerin, CONFIRMED status but confirmed=false): check before shunting
  - 5 PENDING confirmed=false (IDs 97, 24999, 25029, 25030, 25033): leave as-is
- BC 25006 (Marina Larripa): ends Aug 3, last teaching day was Fri Jul 31 -- cosmetic only
- FIX WINDOW CLOSES TONIGHT -- school reopens Monday Aug 4.

## Fix recipe -- NOT YET RUN

Step 1: Insert August Bank Holiday closure
  INSERT INTO school_closures (created_at, name, start_date, end_date, note, is_paid_holiday)
  VALUES (NOW(), 'August Bank Holiday', '2026-08-03', '2026-08-03', 'Public Holiday Aug 2026', false);

Step 2: Shunt 14 confirmed BCs from Aug 3 to Aug 4
  UPDATE booking_courses SET start_date = '2026-08-04'
  WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984, 25002, 25010, 25016, 25028, 25035)
    AND start_date = '2026-08-03' AND active = true;
  -- Expected: 14 rows updated

Step 3: Delete duplicate BC 25003
  SELECT id FROM student_class_assignments WHERE booking_course_id = 25003; -- Expect 0 rows
  DELETE FROM booking_courses WHERE id = 25003; -- 1 row

Step 4: Check BC 24627 before shunting
  SELECT bc.id, b.status, b.confirmed, s.first_name, s.last_name
  FROM booking_courses bc JOIN bookings b ON b.id=bc.booking_id JOIN students s ON s.id=b.student_id WHERE bc.id=24627;
  -- If confirmed=true: UPDATE booking_courses SET start_date = '2026-08-04' WHERE id = 24627;

Step 5 (cosmetic): UPDATE booking_courses SET end_date = '2026-07-31' WHERE id = 25006;

Step 6: Verify
  SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true;
  SELECT * FROM school_closures WHERE start_date = '2026-08-03';

## Risk
Category: bookings, data-integrity | Reversible: Yes
Blast radius: 14 BC records updated, 1 deleted, 1 closure inserted
CRITICAL: Last chance -- school reopens Mon Aug 4

## Status
Fix NOT RUN. 23rd hourly check, 5th check today.
Last checked: Fri 31 Jul 2026 UTC