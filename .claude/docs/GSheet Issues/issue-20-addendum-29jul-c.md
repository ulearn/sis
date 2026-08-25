Issue 20 -- Ariunsarnai Batbayar -- Payment Due / Not in Class (64th check, 29 Jul 2026)

Reporter: (unknown) | Area: Booking / Class | Sheet row: 21

Symptom
=======
Student not appearing in class-to-be-assigned -- system reports payment due.

Root cause (DB, 29 Jul 2026 UTC -- 64th hourly check)
======================================================
- Booking 1605 (Ariunsarnai Batbayar, student 1047): status = PENDING, confirmed = false, amountOpen = EUR 1509.
- Zero payments recorded against booking 1605 in the payments table. UNCHANGED.
- Booking last updated: 2026-06-23 (36 days ago). Data source: FIDELO.
- HubSpot deal ID: 502951083215.
- Booking course 1791 (Academic Year Renewal Morning, Apr 13-Oct 23 2026): active = true.
- Day 115+ since booking was supposed to be active; no payment has landed in SIS.

Fix recipe -- NOT YET RUN
=========================

Step 1 -- Check HubSpot deal 502951083215 for payment
NOT YET RUN:
  Open HubSpot deal 502951083215 and check for associated payments and invoices.
  Check if payment was received outside SIS (Transfermate, Xero, direct bank transfer not yet synced).

Step 2 -- Check Hub Xero/TransferMate records for booking 1605
NOT YET RUN:
  ssh hub@localhost
  Check /home/hub/web/hub.ulearnschool.com/public_html/fins/ for any payment linked to deal 502951083215.

Step 3 -- If payment exists, add it to SIS and confirm booking
NOT YET RUN:
  SIS admin -> Booking 1605 -> Add Payment
  Or via DB:
  INSERT INTO payments (booking_id, amount, payment_date, method, data_source, created_at)
  VALUES (1605, <amount>, '<date>', '<method>', 'MANUAL', NOW());
  Then confirm booking:
  UPDATE bookings SET status = 'CONFIRMED', confirmed = true, updated_at = NOW() WHERE id = 1605;

Step 4 -- If no payment found, contact student or agency
NOT YET RUN:
  Payment outstanding 115+ days. Contact student 1047 or their agency via HubSpot deal 502951083215.

Risk / category
===============
Money/Bookings -- confirm payment exists before inserting. Reversible.

Status
======
OPEN -- Fix NOT RUN. 64th check 29 Jul 2026 UTC.
EUR 0 paid vs 1509 total. 0 payments in DB. Day 115+. HubSpot deal 502951083215.

Last checked
============
2026-07-29 UTC