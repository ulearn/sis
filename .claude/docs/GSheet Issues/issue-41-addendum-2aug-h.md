# Issue 41 — Giampaolo Russo Dual Accommodation (addendum 2 Aug 2026 — run H)
Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Status: 55th check, 10th today

Student Giampaolo Russo (ID 14571, booking 18180) arrived today (Sun 2 Aug 2026).
First class: TUESDAY 4 Aug (Aug 3 = Bank Holiday, school closed).

BC 24956 (General English AM, Aug 3-Sep 11, active=true): 0 class assignments — URGENT.
  NOTE: BC 24956 start_date = Aug 3 — it is in the Aug Bank Holiday shunt list (Issue 38).
  If Issue 38 fix runs tonight, BC 24956 start_date will move to Aug 4 automatically.
  SCA week_start should use Aug 4 regardless.

BA 11357 (bed 178, host family, Aug 2-Sep 6, EUR 1,250, active=true): correct, in DB.
Capel Street BA (Sep 6-Sep 14): still absent from DB — Neil to confirm bed + fee.
  Available Capel beds (prior checks): 161, 168, 174, 175, 176.

Payment 17954 (EUR 2,584.96, Bank, 2026-06-26): xeroPaymentId = null — 37 days unreconciled.

Fix recipe (NOT YET RUN):

Step 1 (URGENT — before Tue 4 Aug): Create SCA for BC 24956
  Via SIS admin: assign student 14571 to General English AM for week of Aug 4.
  Or direct DB:
  INSERT INTO student_class_assignments
    (booking_course_id, student_id, class_id, week_start, week_end, created_at, updated_at)
  VALUES (24956, 14571, <class_id>, '2026-08-04', '2026-08-08', NOW(), NOW());
  (Confirm class_id with teacher schedule for General English AM from Tue Aug 4.)

Step 2 — Add Capel Street BA after Neil confirms bed + fee:
  INSERT INTO booking_accommodations
    (booking_id, bed_id, start_date, end_date, active, fee, created_at, updated_at)
  VALUES (18180, <bed_id>, '2026-09-06', '2026-09-14', true, <fee>, NOW(), NOW());

Step 3 — Reconcile payment 17954 in Xero:
  UPDATE payments SET xero_payment_id = '<xero-id>' WHERE id = 17954;

Risk: bookings/money | All reversible | SCA most urgent (student starts Tue 4 Aug)
Status: NOT RUN | Last checked: 2026-08-02 UTC (55th check, 10th today)
