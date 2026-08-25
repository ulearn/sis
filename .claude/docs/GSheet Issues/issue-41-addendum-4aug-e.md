# Issue 41 — Giampaolo Russo: Capel Accommodation + Xero Payment (7th check Tue 4 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accommodation | Sheet row: 43

## Symptom
Russo booked host family (Aug 2-Sep 6) + Capel Street apartment (Sep 6-Sep 14).
Capel accommodation not in SIS. Payment not reconciled in Xero.
Class assignment now in place (SCA 404, class 8, Aug 3-Sep 11) — progress since last run.

## Root Cause (verified 2026-08-04 UTC, 7th check)
- Student 14571 (Giampaolo Russo), booking 18180: CONFIRMED, confirmed = true, EUR 2,584.96 fully paid.
- Booking course 24956 (General English AM, 2026-08-03 to 2026-09-11): active = true.
  Class assignment SCA 404: class 8, 2026-08-03 to 2026-09-11. NOW ASSIGNED (progress).
- Booking accommodation 11357 (bed 178, host family, 2026-08-02 to 2026-09-06): active, fee EUR 1,250. OK.
- Capel Street accommodation (2026-09-06 to 2026-09-14): NOT in booking_accommodations.
- Payment 17954 (EUR 2,584.96): xero_payment_id = null — 36 days unreconciled since 2026-06-29.

## Fix Recipe (NOT YET RUN)

Step 1 — Verify current BAs:
  SELECT id, bed_id, start_date, end_date, active, fee FROM booking_accommodations WHERE booking_id = 18180;
  Expect 1 row: id 11357 (host family, Aug 2-Sep 6).

Step 2 — Create Capel Street accommodation:
  a) Confirm with accommodation team which Capel bed is free Sep 6-Sep 14.
     Premium Capel beds confirmed available as of 4 Aug: 83, 161, 168, 174, 175.
  b) Confirm fee for 1 week + 1 night at Capel Street.
  Then:
  INSERT INTO booking_accommodations (booking_id, bed_id, start_date, end_date, active, fee)
  VALUES (18180, <bed_id>, '2026-09-06', '2026-09-14', true, <fee>);

Step 3 — Reconcile payment 17954 in Xero:
  In Xero: find unreconciled receipt EUR 2,584.96 dated 2026-06-29 (Giampaolo Russo, booking 18180).
  Match to correct invoice. Once reconciled, update SIS:
  UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17954;

Step 4 — Verify:
  SELECT id, start_date, end_date, fee FROM booking_accommodations WHERE booking_id = 18180;
  Expect 2 rows: host family (Aug 2-Sep 6) + Capel (Sep 6-Sep 14).
  SELECT xero_payment_id FROM payments WHERE id = 17954;
  Expect: non-null Xero reference.

## Risk / Category
bookings, accommodation, payments | Reversible: yes | Student 14571 only

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (7th check)
SCA assigned — student attending school. Remaining work: Capel BA + Xero reconciliation.