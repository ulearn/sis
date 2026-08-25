Issue 41 — Giampaolo Russo Dual Accommodation (addendum 2 Aug 2026 — run G)
Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Status: 54th check, 9th today

Student Giampaolo Russo (ID 14571) arrived today (Sun 2 Aug 2026).
First class: TUESDAY 4 Aug (Aug 3 = Bank Holiday, school closed).

BC 24956 (General English AM, Aug 3-Sep 11, active=true): 0 student class assignments — URGENT.
BA 11357 (bed 178, host family, Aug 2-Sep 6, EUR 1,250, active=true): correct, in DB.
Capel Street BA (Sep 6-Sep 14): still absent — Neil to confirm bed + fee.
Payment 17954 (EUR 2,584.96, Bank, 2026-06-26): xeroPaymentId=null — 37 days unreconciled.

Fix recipe (NOT YET RUN):

Step 1 (URGENT — before Tue 4 Aug): Create SCA for BC 24956
  Via SIS admin: assign student 14571 to General English AM for week of Aug 4.
  Or DB (confirm class_id first):
  INSERT INTO student_class_assignments
    (booking_course_id, student_id, class_id, week_start, week_end, created_at)
  VALUES (24956, 14571, <class_id>, '2026-08-03', '2026-08-07', NOW());

Step 2 — Add Capel St BA after Neil confirms bed + fee:
  INSERT INTO booking_accommodations
    (booking_id, bed_id, start_date, end_date, active, fee, created_at)
  VALUES (18180, <bed_id>, '2026-09-06', '2026-09-14', true, <fee>, NOW());
  Available Capel beds (prior checks): 161, 168, 174, 175, 176.

Step 3 — Reconcile payment 17954 in Xero:
  UPDATE payments SET xero_payment_id = '<xero-id>' WHERE id = 17954;

Risk: bookings/money | all reversible | SCA most urgent (student starts Tue)
Status: NOT RUN | Last checked: 2026-08-02 UTC (54th check, 9th today)
