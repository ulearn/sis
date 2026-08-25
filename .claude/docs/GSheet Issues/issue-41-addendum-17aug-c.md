# Issue 41 — Giampaolo Russo (110th check, 17 Aug 2026 UTC)
Reporter: Diego | Area: Booking/Accomm | Sheet row: 43

## Symptom
Two accommodation types; system would not add second BA. SCAs duplicated.

## Root cause (evidence)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, confirmed = true, amountPaid = EUR 2,584.96, amountOpen = EUR 0
- SCA 424 (class 12, weekStart 2026-08-17, weekEnd 2026-09-11, BC 24956): ACTIVE TODAY — started today
- SCA 426 (class 12, weekStart 2026-08-10, weekEnd 2026-09-11, BC 24956): also active — DUPLICATE
- Both SCAs are on class 12, same BC — student appears twice in attendance for Aug 17 onward
- BA 11357 (bed 178, Aug 2 to Aug 15): 2 days past end, still active, fee = EUR 1,250 — stale
- BA 11396 (bed 44, Aug 15 to Aug 22): CURRENT occupancy, fee = null — needs fee set
- BA 11397 (bed 89, Aug 22 to Sep 6): check-in 5 days, fee = null — needs fee set before Aug 22
- BA 11392 (no bed, Sep 6 to Sep 14): fee = EUR 415, bedId = null — bed not assigned yet

## Fix recipe (NOT YET RUN)

Step 1 — Delete SCA 424 (the duplicate that started today; SCA 426 started earlier is the valid one):
  Via SIS admin UI OR:
  DELETE FROM StudentClassAssignment WHERE id = 424;

Step 2 — Deactivate BA 11357 (bed 178, ended Aug 15, 2 days stale):
  UPDATE BookingAccommodation SET active = false WHERE id = 11357;

Step 3 — Set fee on BA 11396 (current, bed 44, Aug 15-22):
  UPDATE BookingAccommodation SET fee = <confirmed_fee> WHERE id = 11396;

Step 4 — Set fee on BA 11397 (upcoming, bed 89, Aug 22-Sep 6). BEFORE 22 Aug:
  UPDATE BookingAccommodation SET fee = <confirmed_fee> WHERE id = 11397;

Step 5 — Assign bed to BA 11392 (Sep 6-14, Capel St premium room):
  UPDATE BookingAccommodation SET bedId = <correct_bed_id> WHERE id = 11392;

Step 6 — Verify all BAs and SCAs for student 14571.

## Risk / Category
Accommodation + attendance | Reversible | Blast radius: 1 student + attendance records

## Status
OPEN — fix NOT RUN. SCA 424 live today (duplicate). BA 11396 current fee null. BA 11397 check-in 5d fee null. URGENT.
Last checked: 2026-08-17 UTC (110th check)
