# Issue 20 Addendum 8 Aug 2026-b

**Check:** 41st (Sat 8 Aug 2026 UTC) **Sheet row:** 21

## Root Cause
- Student 1047 (Ariunsarnai Batbayar): visa_status=null hubspot_contact_id=780356561119
- Booking 1605: PENDING confirmed=false amount_paid=EUR 0 amount_open=EUR 1509 amount_total=EUR 1509
  service_end=2026-10-23 last_updated=2026-06-23 (46d ago)
- BC 1791 (AY Renewal Morning 13 Apr to 23 Oct 2026): active=true 0 SCAs
- 0 payment records linked to booking 1605
- Day 117 since course start (13 Apr 2026)
- HubSpot contact 780356561119 available - check for payment

## Fix (NOT YET RUN)

Step 1: Check HubSpot contact 780356561119 and deal for payment.

Step 2a (if payment found):
  INSERT INTO payments (booking_id, amount, method, payment_date, paid_by, type)
  VALUES (1605, 1509.00, method, payment_date, paidBy, one_time_or_initial);
  UPDATE bookings SET confirmed=true, amount_paid=1509.00, amount_open=0 WHERE id=1605;

Step 2b (if no payment): contact student/agent re EUR 1509 (117d overdue). Consider cancellation.

Step 3: Once confirmed, assign BC 1791 to AY Morning class in SIS Admin.

## Risk
Money. EUR 1509. Do NOT confirm without verifying payment. Day 117 - escalation appropriate.

## Status
Open NOT YET RUN. Needs HubSpot check first.

## Last Checked
Sat 8 Aug 2026 UTC (41st check)
