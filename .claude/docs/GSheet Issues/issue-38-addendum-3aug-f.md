Issue 38 Aug Bank Holiday Shunt 3 Aug 2026 10th check

Root cause confirmed 10th check today:
school_closures: no entry for 2026-08-03 (August Bank Holiday absent)
21 active BCs with start_date=2026-08-03 unshunted:
88 97 1755 1766 24627 24908 24956 24958 24959 24964 24984
24999 25002 25003 25010 25016 25028 25029 25030 25033 25035
BC25006 ends today 2026-08-03 - deactivate FIRST

Fix recipe NOT YET RUN:
Step 0: INSERT INTO school_closures (name,start_date,end_date,is_paid_holiday) VALUES (August Bank Holiday,2026-08-03,2026-08-03,true);
Step 1: UPDATE booking_courses SET active=false WHERE id=25006;
Step 2: UPDATE booking_courses SET start_date=2026-08-04 WHERE start_date=2026-08-03 AND active=true AND id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24984,24999,25002,25003,25010,25016,25028,25029,25030,25033,25035);
Verify: SELECT id FROM booking_courses WHERE start_date=2026-08-03 AND active=true; expect 0 rows

Risk: bookings 21 students reversible blast-radius medium
OPEN. 81st overall 10th today Mon 3 Aug 2026 UTC. Fix NOT RUN.