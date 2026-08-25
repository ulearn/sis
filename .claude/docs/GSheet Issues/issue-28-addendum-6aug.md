# Issue 28 — Paola Sthefane Moreira: booking confirmed=false + unlinked payment (35th check)
Reporter: | Area: Booking / Class | Sheet row: 29 | Checked: Thu 6 Aug 2026 UTC

## Symptom
Student appears in class but cannot be assigned — system says payment not received.

## Root Cause — live data Thu 6 Aug 2026 UTC (unchanged since 34th check)

- Booking 17850 (Paola Sthefane Missias Moreira, student 14456): CONFIRMED, confirmed = false — anomaly
- Amount paid = null, amount open = EUR 321.35 — booking thinks no payment received
- Payment 17519: EUR 321.35, method = Bank, paymentDate = 2026-05-07, xeroPaymentId = null, transactionId = null — 91 days unreconciled
- Booking last updated 2026-07-08 (29 days ago)
- Booking course 24624 (Morning General, May 18–Jun 5 2026): active = true — 62 days stale

Payment 17519 has bookingId pointing to 17850 (correctly linked), but booking amountPaid has not been recalculated and confirmed was never flipped to true.

## Fix Recipe (NOT YET RUN)

Step 1 — Verify payment link and amount:
  SELECT id, amount, method, payment_date, xero_payment_id, "bookingId" FROM "Payment" WHERE id = 17519;

Step 2 — Set booking confirmed = true and recalculate amounts (verify total fee first):
  p.booking.update({where:{id:17850},data:{confirmed:true,amountPaid:321.35,amountOpen:0}})

Step 3 — Deactivate stale booking course 24624:
  p.bookingCourse.update({where:{id:24624},data:{active:false}})

Step 4 — Reconcile payment 17519 in Xero:
  Find the EUR 321.35 bank receipt dated around 7 May 2026 for Paola Moreira / booking 17850.
  After reconciling: UPDATE "Payment" SET "xeroPaymentId" = '<XERO_ID>' WHERE id = 17519;

## Risk / Category
money / bookings — reversible. Blast radius: 1 booking, 1 payment, 1 booking course.

## Status
Open — booking confirmed=false, amountPaid=null, payment 91 days unreconciled, booking course 62 days stale.
Last checked: Thu 6 Aug 2026 UTC (35th hourly run)