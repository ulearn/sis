Issue 48 -- Telmuun Enkhsaikhan / BC 1810, Booking 1624 (Thu 13 Aug 2026)

Reporter: Laura/Paul | Area: Attendance/Classes | Sheet row: 50
112th check -- Thu 13 Aug 2026 ~16:04 UTC

Symptom:
BC 1810 (Academic Year Renewal Morning, Telmuun) has 0 class assignments 45 days after start.
Booking 1624 is PARTIAL with EUR 250 outstanding. Payment 17956 unreconciled in Xero.

Root Cause (evidence):
- BC 1810: active=true, startDate=2026-06-29, endDate=2027-01-01, classAssignments.length=0 (45 days since start)
- Booking 1624: status=PARTIAL, confirmed=false, amountPaid=EUR 1,406, amountOpen=EUR 250, updatedAt=2026-08-05
- Payment 17956: amount=EUR 100, xeroPaymentId=null, paymentDate=2026-03-31, dataSource=HUBSPOT
- No change since 111th check

Fix Recipe (NOT YET RUN):

Step 1: Assign BC 1810 to an AM class in SIS Admin.
  Students > Telmuun Enkhsaikhan > Booking 1624 > BC 1810 > Assign to Class.
  Select appropriate AM class for the renewal period starting 2026-06-29.

Step 2: Collect EUR 250 outstanding from student (or agent) to resolve PARTIAL status.
  Update booking_id 1624: set confirmed=true once EUR 250 received.

Step 3: Reconcile Payment 17956 (EUR 100) in Xero.

Risk: bookings/attendance | Reversible: yes | Blast radius: 1 student (AY renewal)

Status: OPEN. 0 SCAs on BC 1810 (45d). EUR 250 outstanding. Xero null on pmt 17956.
Last checked: Thu 13 Aug 2026 ~16:04 UTC
Previous recipe: issue-48-addendum-13aug-e.md