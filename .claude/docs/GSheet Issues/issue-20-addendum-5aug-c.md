# Issue 20 - Ariunsarnai Batbayar: Payment Due, No Class (25th check)

Reporter: PG | Area: Booking / Class | Sheet row 21 | Last checked: 2026-08-05 UTC (25th check)

State - verified 25th check Wed 5 Aug 2026 UTC
No change from 24th check. Open 115 days since course start 2026-04-13.

Booking 1605 (Ariunsarnai Batbayar, student 1047):
- Status: PENDING
- confirmed = false
- amount_paid = EUR 0
- amount_open = EUR 1,509
- 0 payment records
- 0 class assignments

Booking course 1791 (Academic Year Renewal Morning):
- startDate = 2026-04-13, endDate = 2026-10-23
- active = true, 0 class assignments

Root Cause:
Booking 1605 fully unpaid (EUR 1,509 outstanding, 0 payment records). Unconfirmed booking excludes student
from assignment queue; no class assignment means no attendance tracking. 115 days without payment.

Fix Recipe (NOT YET RUN):

Step 1 - Chase payment of EUR 1,509. Verify with staff whether student is still attending or has left.

Step 2 - Once payment confirmed:
  UPDATE bookings SET confirmed = true, status = 15 WHERE id = 1605;
  (Note: replace 15 with the CONFIRMED enum value in your schema)

Step 3 - Assign booking course 1791 to appropriate class in SIS admin (backfill from 2026-04-13 if attending).

If student has left: mark booking CANCELLED and deactivate BC 1791.

Risk: money / bookings | Reversible | Blast radius: 1 student, EUR 1,509 outstanding.
Status: OPEN - 25th check 2026-08-05 UTC. NOT YET RUN. 115 days open.