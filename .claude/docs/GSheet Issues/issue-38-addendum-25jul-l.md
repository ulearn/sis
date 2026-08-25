Issue 38 addendum-25jul-l
Reporter: staff | Sheet row 40
Status: 104th check Sat 25 Jul 2026 UTC UNCHANGED. Aug 3 now 8 days away.
Aug 3 Bank Holiday: NOT in school_closure table (8 days away).
17 active booking courses start Aug 3 -- all need shunting to Aug 4.
BC 25016 (Life Pass Morning, BK18238): endDate=2028-08-29 -- typo, should be 2026-08-29.
BC 25003 (General English AM, BK18225): duplicate of BC 25002 -- deactivate.

Fix (NOT YET RUN):
1. INSERT school_closure for Aug 3 2026 (August Bank Holiday).
2. Run shunt for 17 active BCs starting Aug 3 to Aug 4.
3. UPDATE bookingCourse SET endDate=2026-08-29 WHERE id=25016.
4. UPDATE bookingCourse SET active=false WHERE id=25003.