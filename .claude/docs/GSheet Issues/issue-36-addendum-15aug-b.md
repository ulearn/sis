Issue 36 (Pietro Caccianiga) addendum 15 Aug 2026 UTC 193rd check

Reporter: KC | Area: Booking/Accomm | Sheet row: 38

ROOT CAUSE (193rd check)
- Student: Pietro Caccianiga (booking 17980, student 14521): CONFIRMED, fully paid EUR 5,331
- BA 11311 (bed 84): Jun 28 to Aug 22 2026, fee = EUR 3,850 -- current stay, ends in 7 days
- BA 11393 (bed 88, Capel Street): Aug 22 to Sep 13 2026, fee = null, accommodationType = null, roomType = null, board = null
  -- check-in in 7 days (Aug 22); all fields still empty
- Payment 17733: EUR 5,331, Bank, Jun 2 2026 -- xeroPaymentId = null (74 days unreconciled)
- No change from 192nd check (earlier Sat 15 Aug UTC)

FIX RECIPE (NOT YET RUN)
Before Aug 22 (7 days):
  UPDATE booking_accommodation SET
    fee = <capel_weekly_rate x 3>,
    accommodation_type = City Centre Apartment,
    room_type = <check booking>,
    board = Self Catering
  WHERE id = 11393; -- NOT YET RUN

Reconcile Payment 17733 (EUR 5,331) in Xero -- 74 days unreconciled.

RISK: reversible. Fee null on BA 11393 means provider payment calculation will fail.
STATUS: URGENT - check-in Aug 22 (7 days), fee + types null. Last checked: 15 Aug 2026 UTC (193rd check / 295th run)