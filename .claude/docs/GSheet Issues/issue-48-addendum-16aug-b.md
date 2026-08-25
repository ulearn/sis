issue 48 — Telmuun Enkhsaikhan no class + EUR 250 open (322nd run, 16 Aug 2026 UTC)

Reporter: staff | Area: Booking/Class | Row: 50

SYMPTOM
Renewal student 49 days into active course with zero class assignments; EUR 250 outstanding.

ROOT CAUSE (live, 322nd run — confirmed unchanged)

Student: Telmuun Enkhsaikhan (student 293, booking 1624)
Booking 1624: status=PARTIAL, confirmed=false, amountPaid=EUR 1,406, amountOpen=EUR 250

Booking Course 1810 (Academic Year Renewal Morning): 29 Jun 2026-1 Jan 2027, active=true
  => 49 days active with 0 Student Class Assignments

Payments directly linked to booking 1624 (payment.bookingId=1624):
  Payment 17956: EUR 100, paymentDate 31 Mar 2026, xeroPaymentId=null
  (Note: amountPaid=EUR 1,406 suggests additional payments linked differently or via Fidelo import)

FIX RECIPE (NOT YET RUN)

Step 1 — Assign student to a class
  Check which morning class student attended before renewal, then create SCA for BC 1810.
  INSERT INTO student_class_assignments (student_id, booking_course_id, week_start, week_end, class_id)
  VALUES (293, 1810, '2026-06-29', '2027-01-01', <class_id>);
  Alternatively, assign via SIS admin UI.

Step 2 — Chase EUR 250 outstanding balance
  Contact student/agency for remaining payment.

Step 3 — Reconcile Payment 17956 (EUR 100, Mar 31 2026) in Xero
  UPDATE payments SET xero_payment_id = <xero_id> WHERE id = 17956;
  (Or reconcile via Xero UI)

Step 4 — Investigate EUR 1,406 amountPaid source
  Only EUR 100 (payment 17956) is directly linked via bookingId. EUR 1,306 difference suggests
  payments imported from Fidelo or linked via HubSpot. Verify in Hub fins/ or HubSpot deal.

RISK
Category: bookings/class/money. Student in active course 49 days, no class. EUR 250 open.
Reversible. Single student, low blast radius.

STATUS
322nd run, 16 Aug 2026 UTC. Fix NOT RUN. 49 days without class assignment.