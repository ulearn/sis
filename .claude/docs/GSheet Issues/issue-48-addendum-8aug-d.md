Issue 48 -- Multiple Students Attendance/Class (77th check, 8 Aug 2026)
Reporter: Paul/Staff | Area: Attendance/Classes | Sheet row: 50

Root cause (77th check Sat 8 Aug 2026 UTC), unchanged from 76th check:

Telmuun Enkhsaikhan (student 293):
  BC 482  AY Afternoon:         ended 14 Mar 2025  -- 512 days stale, active=true
  BC 483  AY Afternoon:         ended 11 Jul 2025  -- 393 days stale, active=true
  BC 1609 AY Renewal Afternoon: ended 19 Dec 2025  -- 232 days stale, active=true
  BC 1610 AY Renewal Afternoon: ended 9 Jan 2026   -- 211 days stale, active=true
  BC 1611 AY Renewal Afternoon: ended 6 Mar 2026   -- 155 days stale, active=true
  BC 1612 AY Renewal Afternoon: ended 1 May 2026   -- 99 days stale, active=true

Ana Jessica Rosa de Paula Santos (student 766):
  Booking 1308: CANCELLED, confirmed=false, amount_paid=EUR 1530
  Payment 17186: EUR 1280, xero_payment_id=null
  Payment 17050: EUR 250, xero_payment_id=null
  Total EUR 1530 paid on cancelled booking; refund status unknown

Fix (NOT YET RUN):
  UPDATE booking_courses SET active=false WHERE id IN (482, 483, 1609, 1610, 1611, 1612);
  SELECT id, active, end_date FROM booking_courses WHERE id IN (482, 483, 1609, 1610, 1611, 1612);
  -- Ana Jessica: check Xero for refund status on booking 1308
  -- If not refunded: issue EUR 1530 refund; set xero_payment_id on payments 17050 and 17186

Category: Data-hygiene + money | Reversible: Yes (BCs); Xero check needed (Ana Jessica)
Last checked: 2026-08-08 UTC (77th check)