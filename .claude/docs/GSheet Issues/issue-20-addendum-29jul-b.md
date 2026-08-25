Issue 20 -- Ariunsarnai Batbayar Payment Due (63rd check, 29 Jul 2026)

Reporter: PG | Area: Booking / Class | Sheet row: 21

Symptom
=======
Student not appearing in to-be-assigned -- says payment due.

Root cause (DB, 29 Jul 2026 UTC -- 63rd hourly check)
=====================================================
- Booking 1605 (Ariunsarnai Batbayar, student 1047): status = PENDING, confirmed = false. UNCHANGED.
- Amount paid EUR 0; amount total EUR 1509; 0 payments in DB. UNCHANGED.
- Booking course 1791 (Academic Year Renewal Morning, Apr 13 - Oct 23 2026): active = true.
- Day 115 since booking creation (Apr 6 2026). Last booking update: Jun 23 2026 (36 days ago).
- Source: FIDELO. No HubSpot or Xero payment found in DB.

Fix recipe -- NOT YET RUN
=========================

Step 1 -- Check HubSpot deal for booking 1605 / student 1047
NOT YET RUN:
  Look up student 1047 in SIS, find HubSpot contact / deal ID, check deal payment status.
  If payment exists in HubSpot / Xero: sync payment to SIS booking 1605.

Step 2 -- Check Hub / Xero for any payment against this student
NOT YET RUN:
  ssh hub@localhost -> fins/ -> check Xero for Ariunsarnai Batbayar invoices / payments.
  If invoice paid: create payment record in SIS and confirm booking.

Step 3 -- Confirm booking once payment is verified
NOT YET RUN:
  UPDATE bookings SET status = 'CONFIRMED', confirmed = true, updated_at = NOW()
  WHERE id = 1605 AND status = 'PENDING';

Risk / category
===============
Financial / bookings. Reversible. Blast radius: 1 student, 1 booking.

Status
======
OPEN -- Fix NOT RUN. 63rd check 29 Jul 2026 UTC.
Day 115 since creation. EUR 0 paid of EUR 1509 total. Booking stuck PENDING.

Last checked
============
2026-07-29 UTC