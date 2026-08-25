# Issue 38 — Aug Bank Holiday Shunt (141st check, 4th run Tue 4 Aug 2026 UTC)
Reporter: NM | Area: Holidays/Bookings | Sheet row: 40

## Root Cause (confirmed 2026-08-04 UTC, 4th run today)
- school_closures: 9 entries only (Good Fridays + Christmas). Aug BH 2026-08-03 ABSENT.
- All 21 BCs still have start_date = 2026-08-03, active = true, 0 student_class_assignments — UNCHANGED.
- School resumed Tue 4 Aug. Correct shunt target: 2026-08-04 (today).
- BC ids: 88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24984, 24999, 25002, 25003, 25010, 25016, 25028, 25029, 25030, 25033, 25035

## Fix Recipe (NOT YET RUN)
1. SELECT COUNT(*)::text FROM booking_courses WHERE start_date='2026-08-03' AND active=true; -- Expect 21
2. INSERT INTO school_closures (name,start_date,end_date,note,is_paid_holiday) VALUES ('August Bank Holiday','2026-08-03','2026-08-03','Public holiday Ireland',false);
3. UPDATE booking_courses SET start_date='2026-08-04' WHERE start_date='2026-08-03' AND active=true; -- Expect 21 rows
4. UPDATE booking_courses SET active=false WHERE id=25006; -- BC 25006 Marina Larripa ended Aug3, 1d stale
5. Verify then assign classes via SIS admin for all 21 affected students.

## Risk: bookings, data-hygiene | Reversible: yes | 21 BCs, ~20 students
URGENCY: School resumed today. Students unassigned.

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (141st overall, 4th today)