# Issue 48 — Telmuun Enkhsaikhan: PARTIAL booking, payment discrepancy (125th check, 14 Aug 2026)

Reporter: AC | Area: Attendance/classes | Sheet row: 50

SYMPTOM: Student not appearing in class assignment search; booking PARTIAL; 0 class assignments on BC 1810.

ROOT CAUSE (DB evidence 14 Aug 2026 ~22:00 UTC):
- Booking 1624 (Telmuun Enkhsaikhan, student 293): status = PARTIAL, confirmed = false, amountPaid = EUR 1,406, amountOpen = EUR 250
- Booking Course 1810 (Academic Year Renewal Morning): started 29 Jun 2026, ends 1 Jan 2027, active = true, 0 class assignments — 47 days without assignment
- NEW: Only 1 payment record in DB for booking 1624: Payment 17956 = EUR 100, Bank, 31 Mar 2026, xeroPaymentId = null
- Payment discrepancy: booking.amountPaid = EUR 1,406 but sum of DB payment records = EUR 100
  => EUR 1,306 difference likely came from Fidelo migration lump sum (not individually recorded)
  => Do not rely on DB payment records alone to confirm payment history; check HubSpot deal
- EUR 250 open balance still outstanding
- Student confirmed = false + status PARTIAL = excluded from class assignment search

FIX RECIPE (NOT YET RUN):

Step 1 — Collect EUR 250 open balance from student or agent.

Step 2 — Verify payment history via HubSpot deal (do not trust DB payment records alone):
  HubSpot deal page for booking 1624; check commerce payments or properties for total paid.

Step 3 — Reconcile Payment 17956 (EUR 100, Bank, 31 Mar 2026) in Xero:
  Find EUR 100 Bank payment from Telmuun around 31 Mar 2026.
  Then: UPDATE payment SET xero_payment_id = '<xero-id>' WHERE id = 17956;

Step 4 — Once EUR 250 cleared, set booking confirmed:
  SQL: UPDATE booking SET confirmed = true WHERE id = 1624;

Step 5 — Assign BC 1810 to an AM class via SIS admin:
  Student 293 -> Booking 1624 -> BC 1810 -> assign class for current week.

RISK: Bookings/money — EUR 250 outstanding. Reversible. Blast radius: 1 student.

STATUS: 47 days without class assignment. EUR 250 open. Fix NOT RUN. 125th check.
Last checked: 2026-08-14 ~22:00 UTC