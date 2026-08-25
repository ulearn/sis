Issue 36b -- Pietro Caccianiga BA 11393 fee null (210th check, 17 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 38

Symptom
Accommodation dates wrong; system will not let staff change them. Fee not set.

Root cause (evidence)
- Booking Accommodation 11393 (bed 88, Bed A): fee = null, startDate = 2026-08-22, endDate = 2026-09-13, active = true
- Check-in is in 5 days (Aug 22)
- Booking 17980: CONFIRMED, confirmed = true, amountPaid = EUR 5,331, amountOpen = EUR 0

Fix recipe (NOT YET RUN)

Step 1 -- Confirm agreed fee with Diego/KC (bed 88, Aug 22 to Sep 13 = approx 3.5 weeks).

Step 2 -- Set fee on BA 11393 (NOT here):
  UPDATE BookingAccommodation SET fee = <agreed_amount> WHERE id = 11393;

Step 3 -- Verify:
  SELECT id,fee,startDate,endDate,active FROM BookingAccommodation WHERE id = 11393;

Risk / Category
Accommodation | Reversible | Blast radius: 1 student | DEADLINE: Aug 22 check-in (5 days)

Status
OPEN -- fix NOT RUN. Check-in Aug 22 (5 days). Fee = null.
Last checked: 2026-08-17 UTC (210th check)