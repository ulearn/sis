Issue 41 -- Giampaolo Russo dual accommodation + SCA duplicate (111th check, 17 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 43

Symptom
Student booked host family + apartment; second accommodation not appearing in Matching section.

Root cause (evidence)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, confirmed = true, amountPaid = EUR 2,584.96, amountOpen = EUR 0

SCA duplicate (ACTIVE -- day 1 of overlap period):
- SCA 424: class 12, weekStart 2026-08-17, weekEnd 2026-09-11, Booking Course 24956
- SCA 426: class 12, weekStart 2026-08-10, weekEnd 2026-09-11, Booking Course 24956
- Both active simultaneously -- SCA 424 is redundant (its window is contained within SCA 426)

Accommodation chain:
- BA 11357 (bed 178, Aug 2 to Aug 15): 2 days past end, still active, fee = EUR 1,250
- BA 11396 (bed 44, Aug 15 to Aug 22): CURRENT occupancy, student in room, fee = null -- URGENT
- BA 11397 (bed 89, Aug 22 to Sep 6): check-in in 5 days, fee = null
- BA 11392 (no bed, Sep 6 to Sep 14): fee = EUR 415, bed not yet assigned

Fix recipe (NOT YET RUN)

Step 1 -- Delete duplicate SCA 424 (NOT here):
  DELETE FROM StudentClassAssignment WHERE id = 424;

Step 2 -- Deactivate stale BA 11357 (ended Aug 15):
  UPDATE BookingAccommodation SET active = false WHERE id = 11357;

Step 3 -- Set fee on BA 11396 (current, bed 44, student in room):
  Confirm amount with Diego/KC.
  UPDATE BookingAccommodation SET fee = <agreed_amount> WHERE id = 11396;

Step 4 -- Set fee on BA 11397 (bed 89, check-in Aug 22, 5 days):
  UPDATE BookingAccommodation SET fee = <agreed_amount> WHERE id = 11397;

Step 5 -- Assign bed to BA 11392 (Sep 6 to Sep 14, Capel St premium room):
  UPDATE BookingAccommodation SET bedId = <bed_id> WHERE id = 11392;

Step 6 -- Verify:
  SELECT id,active,fee,startDate,endDate,bedId FROM BookingAccommodation WHERE bookingId = 18180 ORDER BY startDate;
  SELECT id,classId,weekStart,weekEnd FROM StudentClassAssignment WHERE studentId = 14571;

Risk / Category
Accommodation + attendance | Reversible | Blast radius: 1 student | DEADLINE: Aug 22 check-in (5 days)

Status
OPEN -- fix NOT RUN. SCA dup active today (day 1). BA 11396 current fee null. BA 11397 check-in 5d fee null.
Last checked: 2026-08-17 UTC (111th check)