# Issue 38 addendum 29 Jul 2026 run B

Deadline: Fri 31 Jul 2026 (2 days). Aug BH still absent.
School closures: 9 entries, no 2026-08-03.
20 BCs start Aug 3. BC 25003 is duplicate of 25002 (bk 18225).

Fix (NOT YET RUN):
1. INSERT INTO school_closures (name,start_date,end_date,is_paid_holiday) VALUES ("August Bank Holiday","2026-08-03","2026-08-03",true);
2. UPDATE booking_courses SET start_date="2026-08-04" WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25010,25016,25028,25029,25030);
3. UPDATE booking_courses SET active=false WHERE id=25003;

Status: Open -- DEADLINE FRI 31 JUL -- 152nd check. Fix NOT RUN. 2026-07-29 UTC
