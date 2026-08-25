# Issue 38 - August Bank Holiday 2026
Reporter: PG | Row 40 | 168th check Thu 30 Jul UTC

Symptom: Aug BH 2026-08-03 absent from school_closures; 20 booking courses unshunted.

Root cause:
- school_closures has no Aug 2026 entries (confirmed this check)
- 20 non-cancelled BCs start 2026-08-03 (13 CONFIRMED, 7 other)
- DEADLINE Thu 30 Jul EOD

Shunt 19 BCs Aug 3 to Aug 4: 88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25010, 25016, 25028, 25029, 25030
Deactivate: BC 25003 (bk18225, duplicate of BC 25002)
End date extend Aug 3 to Aug 4: BC 25006 (bk18228, Marina Larripa, EUR 828.62 paid)

Fix recipe (NOT YET RUN):
Step 1: INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday) VALUES (August Bank Holiday, 2026-08-03, 2026-08-03, Ireland public holiday, false);
Step 2: UPDATE booking_courses SET start_date = 2026-08-04, updated_at = NOW() WHERE id IN (88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25010, 25016, 25028, 25029, 25030) AND start_date = 2026-08-03;
Step 3: UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 25003;
Step 4: UPDATE booking_courses SET end_date = 2026-08-04, updated_at = NOW() WHERE id = 25006;
Verify: SELECT id, start_date, end_date, active FROM booking_courses WHERE (start_date = 2026-08-03 OR end_date = 2026-08-03) AND active = true; (expect 0 rows)

Risk: bookings/data-hygiene. Reversible. Blast radius: 20 BCs + 1 closure.
Dependency: run before Issue 41 (BC 24956 shunt needed first).
Status: NOT YET RUN. Last checked: 2026-07-30 UTC (168th).