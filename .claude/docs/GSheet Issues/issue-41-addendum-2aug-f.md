# Issue 41 — Giampaolo Russo Dual Accommodation (addendum 2 Aug 2026 — run F)

Reporter: KC | Area: Booking / Accomm | Sheet row 43

## Status (53rd check, 8th today — student arrived today)

Student Giampaolo Russo (ID 14571) arrived today (Sun 2 Aug 2026).
First class: TUESDAY 4 Aug (BC 24956 start=Aug 3 will shunt to Aug 4 after Issue 38 fix).

Booking 18180: CONFIRMED, confirmed=true, amountPaid=EUR 2,584.96, amountOpen=EUR 0.

BC 24956 (General English AM, Aug 3-Sep 11, active=true): 0 SCAs — URGENT before Tue.

BA 11357 (bed 178, host family, Aug 2-Sep 6, EUR 1,250, active=true): in DB — correct.

Capel Street BA: STILL ABSENT. Needed: Sep 6 to Sep 14 2026.
Available Capel beds (prior checks): 161, 168, 174, 175, 176.
Neil must confirm bed + fee before inserting.

Payment 17954: EUR 2,584.96, Bank, paymentDate 2026-06-26, xeroPaymentId=null — 37 days unreconciled.

## Fix recipe (NOT YET RUN)

Step 1 (URGENT — before Tue 4 Aug class) — Create first SCA:
  Via SIS admin UI: assign student 14571 to General English AM class for week Aug 4 on BC 24956.
  Or DB (confirm class_id via SIS admin):
  INSERT INTO student_class_assignments
  (booking_course_id, student_id, class_id, week_start, week_end, created_at)
  VALUES (24956, 14571, <class_id>, '2026-08-03', '2026-08-07', NOW());

Step 2 — Add Capel St BA (after Neil confirms bed + fee):
  INSERT INTO booking_accommodations
  (booking_id, bed_id, start_date, end_date, active, fee, created_at)
  VALUES (18180, <bed_id>, '2026-09-06', '2026-09-14', true, <fee>, NOW());

Step 3 — Reconcile payment 17954 in Xero:
  Find EUR 2,584.96 bank receipt dated 2026-06-26 for Giampaolo Russo.
  UPDATE payments SET xero_payment_id = '<xero-id>' WHERE id = 17954;

## Risk: bookings/money | all reversible | SCA most urgent (student starts Tue)
## Status: URGENT — SCA needed before Tue 4 Aug. Fix NOT RUN. Last checked: 2026-08-02 UTC run F