# Issue 20 — Ariunsarnai Batbayar Payment Due Block (10th check Thu 30 Jul 2026 UTC)

Reporter: PG | Area: Booking/Class | Sheet row: 21

## Root Cause
- Booking 1605 (student 1047, Ariunsarnai Batbayar): status=PENDING, confirmed=false.
- amount_total=EUR 1,509 | amount_paid=EUR 0 | amount_open=EUR 1,509.
- Zero payments in payments table for booking_id=1605.
- BC 1791 (AY Renewal Morning, 2026-04-13 to 2026-10-23): still active.
- Day 108 from course start (Apr 13 to Jul 30). No payment ever received.
- confirmed=false blocks student class assignment view.
- No change from prior checks (30jul-a through 30jul-c).

## Fix Recipe (NOT YET RUN)

Option A — Chase payment (student still expected to pay):
  Search HubSpot for Ariunsarnai Batbayar, confirm EUR 1,509 is outstanding.
  Send payment reminder or escalate to salesperson.
  When payment received: record in payments table, set booking confirmed=true.

Option B — Cancel booking (student not returning):
  UPDATE bookings SET status='CANCELLED', updated_at=NOW() WHERE id=1605;
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE booking_id=1605;

## Risk / Category
Booking/Financial — reversible. Blast radius: 1 student.

## Status
NOT RUN. 10th check Thu 30 Jul 2026 UTC. Day 108, EUR 0 paid. No change.