# Issue 20 — Ariunsarnai Batbayar: PENDING Booking EUR 1,509 Unpaid (28th Check)
Reporter: AC | Area: Booking/Class | Sheet row: 21 | 28th check Wed 5 Aug 2026 UTC
No change from 27th check. Day 116 since course start.

## State (verified live DB)
Student 1047 (Ariunsarnai Batbayar):
Booking 1605: PENDING, confirmed=false, amount_paid=EUR 0, amount_open=EUR 1,509 — fully unpaid, 0 payment records
BC 1791 (Academic Year Renewal Morning, 2026-04-13 to 2026-10-23): active=true, SCAs=0

## Root Cause
Booking 1605 is PENDING with EUR 0 paid — class assignment withheld pending payment.
At 116 days, this is likely: (a) payment received outside SIS not recorded, or (b) student did not enrol.

## Fix Recipe (NOT YET RUN)
Option A — Payment received: verify in Xero/HubSpot, then:
  INSERT INTO payments (booking_id,amount,method,payment_date) VALUES (1605,1509,<method>,<date>);
  UPDATE bookings SET confirmed=true, status='CONFIRMED', updated_at=NOW() WHERE id=1605;
  Assign BC 1791 to class via SIS admin.

Option B — Student did not enrol: cancel (NOT YET RUN):
  UPDATE bookings SET status='CANCELLED', updated_at=NOW() WHERE id=1605;
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=1791;

Neil to check HubSpot deal for Ariunsarnai Batbayar and decide Option A or B.

## Risk
Category: Bookings/money | Reversible: Yes | Blast radius: 1 student
Status: OPEN — NOT YET RUN | Last checked: Wed 5 Aug 2026 UTC (28th check)