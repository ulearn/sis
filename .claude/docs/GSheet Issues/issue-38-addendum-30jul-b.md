# Issue 38 — August Bank Holiday 2026
Reporter: PG | Sheet row: 40 | Last checked: 2026-07-30 UTC (166th check)

## Symptom
Aug Bank Holiday 2026-08-03 absent from school_closures; 20 booking courses unshunted.

## Root cause
- school_closures table has zero rows for August 2026 (confirmed this check)
- Only 2026 entries: Good Friday 2026-04-03 and Christmas 2026-12-21 to 2027-01-03
- 20 non-cancelled booking courses start on 2026-08-03 (13 CONFIRMED, 7 other)
- DEADLINE: Thu 30 Jul 2026 EOD — second check this hour, fix NOT RUN

Shunt Aug 3 to Aug 4 (19 BCs): 88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25010, 25016, 25028, 25029, 25030
Deactivate (duplicate): BC 25003 (booking 18225 — duplicate of BC 25002)
End date extend to Aug 4: BC 25006 (booking 18228)

## Fix recipe (NOT YET RUN)
Step 1: INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday) VALUES (August Bank Holiday, 2026-08-03, 2026-08-03, Ireland public holiday, false);
Step 2: UPDATE booking_courses SET start_date = 2026-08-04, updated_at = NOW() WHERE id IN (88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25010, 25016, 25028, 25029, 25030) AND start_date = 2026-08-03; (expect 19 rows)
Step 3: UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 25003; (expect 1 row)
Step 4: UPDATE booking_courses SET end_date = 2026-08-04, updated_at = NOW() WHERE id = 25006; (expect 1 row)
Verify: SELECT id, start_date, end_date, active FROM booking_courses WHERE (start_date = 2026-08-03 OR end_date = 2026-08-03) AND active = true; (expect 0 rows)

## Risk
Category: bookings, data-hygiene. Reversible. Blast radius: 20 booking courses + 1 school closure insert.
Dependency: run before Issue 41 fix (Giampaolo BC 24956 must shunt to Aug 4 first).

## Status
NOT YET RUN — awaiting Neil approval.
Last checked: 2026-07-30 UTC (166th check). DEADLINE Thu 30 Jul EOD — still pending as of this check.