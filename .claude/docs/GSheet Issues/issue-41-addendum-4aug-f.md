## Issue 41 -- Giampaolo Russo: Capel Accommodation + Xero Payment (9th check Tue 4 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accommodation | Sheet row: 43

## Symptom
Russo booked host family (Aug 2-Sep 6) + Capel Street apartment (Sep 6-Sep 14). Capel BA not in SIS. Payment unreconciled in Xero.

## Root Cause (verified 2026-08-04 UTC, 9th check -- UNCHANGED)
- Student 14571 (Giampaolo Russo), booking 18180: CONFIRMED, confirmed = true, EUR 2,584.96 fully paid.
- Booking course 24956 (General English AM, 2026-08-03 to 2026-09-11): active = true. Class assignment in place.
- Booking accommodation 11357 (bed 178, host family, 2026-08-02 to 2026-09-06): active, fee EUR 1,250. OK.
- Capel Street accommodation (2026-09-06 to 2026-09-14): NOT in booking_accommodations -- only 1 BA for booking 18180.
- Payment 17954 (EUR 2,584.96): paymentDate 2026-06-26, xeroPaymentId = null -- 39 days unreconciled.

## Fix Recipe (NOT YET RUN)

Step 1 -- Verify current booking accommodations:
  SELECT id, bed_id, start_date, end_date, active, fee FROM booking_accommodations WHERE booking_id = 18180;
  Expect 1 row: id 11357 (host family, 2026-08-02 to 2026-09-06, bed 178).

Step 2 -- Create Capel Street accommodation:
  a) Confirm with accommodation team which Capel bed is free 2026-09-06 to 2026-09-14.
  b) Confirm weekly fee for Capel Street (1 week + 1 night = 8 nights).
  Then:
  INSERT INTO booking_accommodations (booking_id, bed_id, start_date, end_date, active, fee)
  VALUES (18180, <capel_bed_id>, '2026-09-06', '2026-09-14', true, <fee>);

Step 3 -- Reconcile payment 17954 in Xero:
  Find unreconciled receipt EUR 2,584.96 dated 2026-06-26 (Giampaolo Russo, booking 18180).
  Once matched: UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17954;

Step 4 -- Verify:
  SELECT id, bed_id, start_date, end_date, fee FROM booking_accommodations WHERE booking_id = 18180;
  Expect 2 rows: host family (Aug 2-Sep 6) + Capel (Sep 6-Sep 14).
  SELECT xero_payment_id FROM payments WHERE id = 17954;

## Risk / Category
bookings, accommodation, payments | Reversible: yes | Student 14571 only

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (9th check)
Student attending school since Aug 3. Capel stay begins Sep 6 (33 days away). Payment 17954 unreconciled 39 days.