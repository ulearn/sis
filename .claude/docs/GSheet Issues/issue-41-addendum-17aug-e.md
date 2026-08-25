Issue 41 -- Giampaolo Russo dual accommodation + SCA duplicate (113th check, 17 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 43

Symptom: student booked host family + apartment; second accommodation not showing in Matching.

Root cause
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, amountPaid=EUR 2584.96, amountOpen=EUR 0

SCA duplicate (ACTIVE -- day 1 of overlap, unchanged since last check):
- SCA 424: class 12, weekStart 2026-08-17, weekEnd 2026-09-11, Booking Course 24956
- SCA 426: class 12, weekStart 2026-08-10, weekEnd 2026-09-11, Booking Course 24956
- SCA 424 fully contained within SCA 426 -- redundant, delete SCA 424

Accommodation chain (unchanged):
- BA 11357: bed 178, Aug 2 to Aug 15, fee EUR 1250, active -- ended 2d ago, stale
- BA 11396: bed 44, Aug 15 to Aug 22, fee null, active -- CURRENT occupant in room
- BA 11397: bed 89, Aug 22 to Sep 6, fee null, active -- check-in in 5 days
- BA 11392: no bed, Sep 6 to Sep 14, fee EUR 415, active -- no bed assigned

Fix recipe (NOT YET RUN)
Step 1 -- Delete SCA 424: DELETE FROM student_class_assignments WHERE id = 424;
Step 2 -- Deactivate stale BA 11357: UPDATE booking_accommodations SET active = false WHERE id = 11357;
Step 3 -- Set fee on BA 11396 (student in room, confirm amount with KC/Diego first): UPDATE booking_accommodations SET fee = <agreed_amount> WHERE id = 11396;
Step 4 -- Set fee on BA 11397 (check-in Aug 22, 5d): UPDATE booking_accommodations SET fee = <agreed_amount> WHERE id = 11397;
Step 5 -- Assign bed to BA 11392: UPDATE booking_accommodations SET bed_id = <bed_id> WHERE id = 11392;
Step 6 -- Verify: SELECT id,active,fee,start_date,end_date,bed_id FROM booking_accommodations WHERE booking_id = 18180 ORDER BY start_date; SELECT id,class_id,week_start,week_end FROM student_class_assignments WHERE student_id = 14571;

Risk: Accommodation + attendance | Reversible | 1 student | DEADLINES: BA 11396 fee null NOW; BA 11397 Aug 22
Status: OPEN -- fix NOT RUN. SCA 424 dup live day 1. BA 11396 current fee null. 113th check 17 Aug 2026 UTC.