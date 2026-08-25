Issue 17 - Ana Jessica Rosa de Paula Santos (addendum 11 Aug 2026)
Sheet row: 18 | Booking 1308 | Student 766 | Area: Booking

Live data (Tue 11 Aug 2026 UTC - 30th check)
- Booking 1308: CANCELLED, confirmed=false, amountPaid=EUR 1,530, amountOpen=null
- Booking last updated 7 Jun 2026 - 65 days with no action
- No other bookings for student 766 - EUR 1,530 stranded on cancelled booking, no successor
- Payment 17186: EUR 1,280 (Bank Transfer, 5 May 2026) - xeroPaymentId=null (98 days unreconciled)
- Payment 17050: EUR 250 (Bank Transfer, 5 May 2026) - xeroPaymentId=null (98 days unreconciled)

Root cause
Booking cancelled. EUR 1,530 in two unreconciled payments sits on a CANCELLED booking. No new booking created. Decision required before any Xero action.

Fix recipe (NOT YET RUN)
Decision required from Neil/management:

Option A - Refund EUR 1,530:
- Process refund via Xero/bank for EUR 1,530 to student
- Mark payments 17186 + 17050 as refunded in Xero

Option B - Reallocate to new booking:
- Create new booking for student 766
- Transfer payments 17186 + 17050 to new booking ID:
  UPDATE payment SET booking_id=NEW_ID WHERE id IN (17186, 17050);
- Reconcile in Xero against new booking

Either way - reconcile in Xero (98 days overdue).

Risk
Money - EUR 1,530 at risk. Xero reconciliation 98 days overdue. Decision needed before action.

Last checked: Tue 11 Aug 2026 UTC