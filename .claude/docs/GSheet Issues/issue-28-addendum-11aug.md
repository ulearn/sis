Issue 28 - Paola Sthefane Missias Moreira (addendum 11 Aug 2026)
Sheet row: 29 | Booking 17850 | Area: Booking / Class

Live data (Tue 11 Aug 2026 UTC - 47th check)
- Booking 17850: CONFIRMED (status), confirmed=false (anomaly); amountPaid=null; amountOpen=EUR 321.35; amountTotal=EUR 321.35
- Payment 17519: EUR 321.35, Bank, 23 May 2026 - linked to booking 17850, xeroPaymentId=null
- Booking Course 24624 (Morning General, 18 May to 5 Jun 2026): active=true - 67 days stale, 0 SCAs
- Booking last updated 8 Jul 2026 (34 days ago)

Root cause
Payment 17519 linked but booking confirmed=false and amountPaid not updated after payment was linked. Stale BC 24624 not deactivated (course ended Jun 5).

Fix recipe (NOT YET RUN)
1. Confirm booking and record payment:
   UPDATE booking SET confirmed=true, amount_paid=321.35, amount_open=0 WHERE id=17850;

2. Deactivate stale BC 24624:
   UPDATE booking_course SET active=false WHERE id=24624;

3. Reconcile payment 17519 (EUR 321.35) in Xero via Hub fins/

4. Verify:
   SELECT confirmed, amount_paid, amount_open FROM booking WHERE id=17850;
   SELECT active FROM booking_course WHERE id=24624;

Risk
Bookings / money. Reversible. 1 student. Xero reconciliation overdue.

Last checked: Tue 11 Aug 2026 UTC