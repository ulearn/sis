Issue 24 -- Alberto Squillace -- Visa Status Null (148th check, 29 Jul 2026)

Reporter: AC | Area: Booking | Sheet row: 25

Symptom
=======
Student not appearing in class-to-be-assigned. Root cause confirmed: visaStatus = null.

Root cause (DB, 29 Jul 2026 UTC -- 148th hourly check)
=======================================================
- Student 1052 (Alberto Squillace): visaStatus = null. Last updated 2026-07-28 (bulk touch only).
- Booking course 24686 (Morning General, booking 1611): Jul 20-Sep 18 2026, active = true, fee = null.
- Zero class assignments on booking course 24686. 9 teaching days lost since course started Jul 20.
- Payment 17124: EUR 1280.12, paid 2026-03-25 via Bank Transfer, xeroPaymentId = null.
- HubSpot contact ID: 740892067018.
- 51 days remaining in course (ends Sep 18 2026).

Fix recipe -- NOT YET RUN
=========================

Step 1 -- Check visa status in HubSpot
NOT YET RUN:
  Check HubSpot contact 740892067018 for visa / IRP entry status.

Step 2 -- Set visa status in SIS admin
NOT YET RUN:
  Student profile 1052 -> Visa Status -> set to appropriate value.
  Or via DB:
  UPDATE students SET visa_status = 'APPROVED', updated_at = NOW() WHERE id = 1052;

Step 3 -- Set booking course 24686 fee
NOT YET RUN:
  Check HubSpot deal for course fee, then:
  UPDATE booking_courses SET fee = <correct_fee>, updated_at = NOW()
  WHERE id = 24686 AND booking_id = 1611;

Step 4 -- Assign student to class for booking course 24686
NOT YET RUN:
  SIS admin -> Booking 1611 -> Class Assignment -> assign to Morning General class from current week.

Step 5 -- Reconcile payment 17124 with Xero
NOT YET RUN:
  Payment 17124 (EUR 1280.12) has no xeroPaymentId. Find Xero payment for booking 1611 and link it.

Risk / category
===============
Data -- low blast radius; reversible.
9 teaching days already lost; further delay extends the loss.

Status
======
OPEN -- Fix NOT RUN. 148th check 29 Jul 2026 UTC.
visaStatus = null. fee = null. 9 days lost. 51 days remain.

Last checked
============
2026-07-29 UTC