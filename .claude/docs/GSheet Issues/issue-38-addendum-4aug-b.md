Issue 38 - Aug Bank Holiday Shunt (3rd check Tue 4 Aug 2026 UTC)
Reporter: NM | Area: Holidays/Bookings | Sheet row: 40

Root Cause (fresh 2026-08-04 UTC)
- school_closures: 9 entries only (Good Fridays + Christmas). Aug BH 2026-08-03 ABSENT.
- 21 booking courses start_date=2026-08-03: ALL active=true, ALL 0 SCAs. UNCHANGED.
- BC 25006 (Marina Larripa, ended Aug 3): active=true, 2 days stale.
- Affected BC ids: 88 97 1755 1766 24627 24908 24956 24958 24959 24964 24984 24999 25002 25003 25010 25016 25028 25029 25030 25033 25035

Fix Recipe (NOT YET RUN)
Step 1: SELECT COUNT(*) FROM booking_courses WHERE start_date=2026-08-03 AND active=true; -- Expect 21
Step 2: INSERT INTO school_closures (name,start_date,end_date,is_paid_holiday) VALUES (August Bank Holiday 2026,2026-08-03,2026-08-03,true);
Step 3: UPDATE booking_courses SET start_date=2026-08-04 WHERE start_date=2026-08-03 AND active=true;
Step 4: UPDATE booking_courses SET active=false WHERE id=25006;
Step 5: Verify count=0; assign classes for all 21 students.

Risk: bookings, data-hygiene | Reversible: yes | 21 BCs, ~20 students.
URGENCY: ACT TODAY - school resumed, 21 students have 0 class assignments.

Status: NOT YET RUN | Last checked: 2026-08-04 UTC (140th overall, 3rd today)