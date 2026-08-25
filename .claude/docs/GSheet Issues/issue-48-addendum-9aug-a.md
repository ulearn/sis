Issue 48 (78th check Sun 9 Aug 2026) -- Sheet row 50

Component A: Telmuun Enkhsaikhan (student 293) -- 6 stale booking courses, unchanged from 77th check:
  BC 482 (Academic Year Afternoon): ended 14 Mar 2025 -- 513 days stale
  BC 483 (Academic Year Afternoon): ended 11 Jul 2025 -- 394 days stale
  BC 1609 (Academic Year Renewal Afternoon): ended 19 Dec 2025 -- 233 days stale
  BC 1610 (Academic Year Renewal Afternoon): ended 9 Jan 2026 -- 212 days stale
  BC 1611 (Academic Year Renewal Afternoon): ended 6 Mar 2026 -- 156 days stale
  BC 1612 (Academic Year Renewal Afternoon): ended 1 May 2026 -- 100 days stale

Component B: Ana Jessica Rosa de Paula Santos (student 766):
  Booking 1308: CANCELLED, confirmed=false, amount_paid=EUR 1530, amount_open=null
  Payment 17186: EUR 1280, Bank Transfer, 1 May 2026, xero_payment_id=null
  Payment 17050: EUR 250, Bank Transfer, 17 Feb 2026, xero_payment_id=null (same D2026101 ref)

Fix recipe (NOT YET RUN):
  Telmuun: UPDATE booking_courses SET active=false WHERE id IN (482,483,1609,1610,1611,1612);
  Ana Jessica: Neil to decide refund or reallocate EUR 1530. Then reconcile pmts 17186+17050 in Xero.

Risk: Data hygiene + money (EUR 1530). Reversible. Blast: 2 students.
Status: NOT RUN | Last checked: 2026-08-09 UTC (78th check)
