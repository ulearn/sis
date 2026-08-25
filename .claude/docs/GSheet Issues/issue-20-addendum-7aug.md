Issue 20 - Ariunsarnai Batbayar EUR 1,509 unpaid (37th check, 7 Aug 2026)
Reporter: PG | Sheet row: 21

Symptom: Booking 1605 PENDING, EUR 1,509 fully unpaid, day 117 since course start (13 Apr 2026).

Root Cause (verified live - unchanged from 36th check):
- Booking 1605 (Ariunsarnai Batbayar, student 1047): status=PENDING, confirmed=false
- Amount total = EUR 1,509, amount paid = EUR 0, amount open = EUR 1,509 - fully unpaid
- 0 payment records linked to booking 1605
- Booking Course 1791 (AY Renewal Morning, 13 Apr to 23 Oct 2026): active - student attending

Fix Recipe (NOT YET RUN):
Step 1 - Check HubSpot deal for payment evidence:
  HubSpot: find contact for student 1047 / booking 1605; check for any payment recorded.

Step 2a - If paid: link payment and confirm:
  UPDATE payments SET booking_id=1605 WHERE id=<payment_id>;
  UPDATE bookings SET confirmed=true, amount_paid=1509, amount_open=0 WHERE id=1605;

Step 2b - If not paid: contact student/agent re EUR 1,509 outstanding (117 days overdue).

Risk: Financial | EUR 1,509 outstanding | Single student
Status: Fix NOT RUN | Last checked: Fri 7 Aug 2026 UTC (37th check)
