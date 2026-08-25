Issue 48 - Telmuun Enkhsaikhan (124th check, 14 Aug 2026)

Reporter: AC | Area: Attendance/classes | Sheet row: 50

SYMPTOM: Telmuun not appearing in class assignment search; booking PARTIAL; no class assigned.

ROOT CAUSE (DB evidence 14 Aug 2026 ~21:00 UTC):
Booking 1624 (Telmuun Enkhsaikhan, student 293):
  status = PARTIAL, confirmed = false
  amountPaid = EUR 1,406, amountOpen = EUR 250
  updatedAt = 2026-08-05
Booking Course 1810 (Academic Year Renewal Morning):
  startDate = 2026-06-29, endDate = 2027-01-01, active = true
  Student Class Assignments = 0 (46 days since BC started)
  updatedAt = 2026-08-05
Payment 17956: EUR 100, Bank, xeroPaymentId = null, paymentDate = 2026-03-31

Booking confirmed=false + status=PARTIAL excludes student from class assignment search.

FIX RECIPE (NOT YET RUN):

Step 1 - Collect EUR 250 open balance from student/agent.

Step 2 - Reconcile Payment 17956 in Xero:
  - Log into Xero, find payment 17956 (EUR 100, Bank, Mar 31 2026)
  - Match to invoice for booking 1624
  - Set xeroPaymentId once reconciled

Step 3 - Once balance cleared, set booking confirmed:
SQL: UPDATE booking SET confirmed = true WHERE id = 1624;

Step 4 - Assign BC 1810 to an AM class via SIS admin:
  Navigate to student 293 -> Booking 1624 -> BC 1810 -> assign class

RISK: Bookings/money - EUR 250 still owed. Reversible. Blast radius: 1 student.

STATUS: No change since 123rd check. BC 1810 still 0 SCAs (46 days). EUR 250 open. Fix NOT RUN.
Last checked: 2026-08-14 ~21:00 UTC