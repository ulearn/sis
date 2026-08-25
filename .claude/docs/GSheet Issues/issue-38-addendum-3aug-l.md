# Issue 38 - Aug BH Shunt (91st check Mon 3 Aug 2026 UTC, 20th today)
Reporter: NM | Area: Holidays/Bookings | Sheet row: 40

Root Cause (fresh):
- No school_closures entry for 2026-08-03 (9 entries exist: Good Fridays + Christmas only)
- 21 active BCs still have start_date=2026-08-03 (unchanged all day across 20 checks)
- BC 25006 (GE AM Plus, bk18228): end_date=2026-08-03, active=true -- needs deactivating
- BC 24956 (Russo, bk18180): among 21 Aug 3 BCs -- first class tomorrow Tue 4 Aug
- FINAL WINDOW closes ~07:30 UTC Tue 4 Aug

Affected BC ids (21): 88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24984, 24999, 25002, 25003, 25010, 25016, 25028, 25029, 25030, 25033, 25035

Fix Recipe (NOT YET RUN):
1. INSERT INTO school_closures (name,start_date,end_date,is_paid_holiday) VALUES ('August Bank Holiday 2026','2026-08-03','2026-08-03',true);
2. UPDATE booking_courses SET start_date='2026-08-04',updated_at=NOW() WHERE start_date='2026-08-03' AND active=true; -- verify count=21 first
3. UPDATE booking_courses SET active=false,updated_at=NOW() WHERE id=25006;
4. SELECT id FROM booking_courses WHERE start_date='2026-08-03' AND active=true; -- expect 0 rows

Risk: bookings | Reversible: yes | Blast: 21 BCs
Status: FINAL WINDOW. Fix NOT RUN. Last checked: 2026-08-03 UTC
