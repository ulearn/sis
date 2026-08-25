Issue 38 Aug Bank Holiday URGENT
Reporter: PG Row 40 Check 58th 8th today

Symptom: Aug BH 2026-08-03 absent from school_closures. 21 active BCs start Aug 3.

Root Cause (58th check 02 Aug 2026):
- school_closures has NO entry for 2026-08-03. Next closure Christmas 2026-12-21.
- 21 active BCs have start_date=2026-08-03, all should start 2026-08-04.
- Booking 18225 has DUPLICATE BCs: 25002 + 25003 (same name General English AM, same end date Sep 18). One must be deactivated.
- Window closes tonight when school opens Mon 3 Aug ~09:00 WEST.

Aug 3 BCs (21): bcId=88 bk=82, bcId=1766 bk=1581, bcId=1755 bk=1571, bcId=24627 bk=17853, bcId=97 bk=89, bcId=24908 bk=18128, bcId=24964 bk=18188, bcId=24958 bk=18182, bcId=24956 bk=18180 (Giampaolo), bcId=24959 bk=18183, bcId=24984 bk=18207, bcId=24999 bk=18222, bcId=25035 bk=17915, bcId=25002 bk=18225 DUPLICATE, bcId=25003 bk=18225 DUPLICATE deactivate one, bcId=25010 bk=18232, bcId=25028 bk=18249, bcId=25029 bk=18250, bcId=25016 bk=18238, bcId=25030 bk=18251, bcId=25033 bk=18254

Fix Recipe (NOT YET RUN):
1. INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday) VALUES (August Bank Holiday, 2026-08-03, 2026-08-03, true);
2. UPDATE booking_courses SET start_date=2026-08-04 WHERE id IN (88,1766,1755,24627,97,24908,24964,24958,24956,24959,24984,24999,25035,25002,25010,25028,25029,25016,25030,25033) AND start_date=2026-08-03 AND active=true;
3. UPDATE booking_courses SET active=false WHERE id=25003; (duplicate)
4. Verify: SELECT COUNT(*) FROM booking_courses WHERE start_date=2026-08-03 AND active=true; expect 0.

Risk: Bookings + calendar. Reversible. 21 students. URGENT window closes tonight.

Status: UNRESOLVED Fix NOT RUN
Last checked: 2026-08-02 UTC