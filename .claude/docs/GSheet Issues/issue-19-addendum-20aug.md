Issue 19 Addendum 20 Aug 2026 (19th check)
Mai Lan Chu | Booking / Class | Sheet row 20

No change from 19 Aug.

Root cause:
- Booking Courses 89 (Morning IELTS) and 90 (Private Lessons) ended 2026-05-22 - 90 days stale active=true
- Booking 83 Mai Lan Chu CONFIRMED confirmed=true amountPaid=EUR 2629.80 amountOpen=EUR 0
- Payment 27 EUR 2135.00 Bank Transfer xeroPaymentId=null unreconciled
- Payment 17002 EUR 2629.80 TransferMate xeroPaymentId=null unreconciled
- Payment 17019 EUR 250.00 Stripe xeroPaymentId=null unreconciled
- Total recorded payments EUR 5014.80 vs amountPaid EUR 2629.80 - EUR 2385 gap (payments 27+17019 = 2385)

Fix recipe (NOT YET RUN):
1. Deactivate BC 89: UPDATE booking_courses SET active = false WHERE id = 89;
2. Deactivate BC 90: UPDATE booking_courses SET active = false WHERE id = 90;
3. Reconcile payment 27 (EUR 2135) in Xero - likely pre-SIS or mis-linked booking.
4. Reconcile payments 17002 and 17019 in Xero.
5. Investigate gap: payments 27+17019 = 2385 exactly matches the gap - likely prior-period payments.

Risk: low (BC deactivation), medium (Xero reconciliation). Reversible.
Status: 90 days stale. EUR 2385 gap and 3 Xero-null payments unchanged. Fix pending Neil approval.
Last checked: 2026-08-20 UTC (19th check)