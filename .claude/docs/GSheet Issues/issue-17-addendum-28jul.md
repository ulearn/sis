Issue 17 - Ana Jessica Rosa de Paula Santos - Accidental Cancellation (12th check, Tue 28 Jul 2026)

Reporter: PG | Area: Booking | Sheet row: 18

Current state (Tue 28 Jul 2026 UTC):
- Booking 1308: CANCELLED, confirmed = false (last updated 7 Jun 2026, 51 days ago)
- Amount paid = EUR 1530 / open = 1530 (fully paid despite CANCELLED - anomaly)
- Payment 17186 (EUR 1280): type = null, xeroPaymentId = null, Bank Transfer, created 5 May 2026 - 84 days without Xero link
- Payment 17050 (EUR 250): type = null, xeroPaymentId = null, Bank Transfer, created 5 May 2026 - 84 days without Xero link
- BC 1350 (Academic Year Afternoon): active = true, end 13 Nov 2026 FUTURE - orphaned because booking CANCELLED

Fix recipe (NOT YET RUN):
1. Reinstate booking 1308 in SIS admin if accidental: set CONFIRMED, confirmed = true
2. Reconcile payments 17186 + 17050 in Xero; update xeroPaymentId on both
3. If booking stays CANCELLED: set BC 1350 active = false
4. Verify amountOpen/amountPaid consistent

Risk: Bookings + money | Medium blast radius | Reversible
EUR 1530 in payments with no Xero link (84 days - financial reporting gap)

Status: UNCHANGED - Fix NOT RUN.
Last checked: Tue 28 Jul 2026 UTC