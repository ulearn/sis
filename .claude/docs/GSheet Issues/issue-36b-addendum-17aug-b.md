# Issue 36b — Pietro Caccianiga (209th check, 17 Aug 2026 UTC)
Reporter: Diego | Area: Booking/Accomm | Sheet row: 38

## Symptom
Accommodation dates wrong; system will not allow date changes.

## Root cause (evidence)
- Booking Accommodation 11393 (bed 88, Bed A): fee = null, startDate = 2026-08-22 (check-in 5 days), endDate = 2026-09-13, active = true
- Booking 17980 (Pietro Caccianiga): CONFIRMED, confirmed = true, amountPaid = EUR 5,331, amountOpen = EUR 0
- Fee is null on BA 11393 — needs to be set before check-in on 22 Aug 2026

## Fix recipe (NOT YET RUN)

Step 1 — Confirm the accommodation fee for bed 88 (Bed A) with Diego/accounts.

Step 2 — Set fee on BA 11393 via SIS admin UI (Accommodation > edit BA 11393 > set fee).
  OR direct update (run in psql/node, NOT here):
  UPDATE BookingAccommodation SET fee = <confirmed_fee> WHERE id = 11393;

Step 3 — Verify:
  SELECT id,fee,startDate,endDate,active FROM BookingAccommodation WHERE id = 11393;

## Risk / Category
Accommodation + accounts | Reversible | Blast radius: 1 student

## Status
OPEN — fix NOT RUN. BA 11393 fee null. Check-in 22 Aug 2026 (5 days). URGENT.
Last checked: 2026-08-17 UTC (209th check)
