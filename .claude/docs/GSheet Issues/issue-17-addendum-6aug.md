# Issue 17 — Ana Jessica Rosa de Paula Santos: cancelled booking + unreconciled payments (24th check)
Reporter: | Area: Booking | Sheet row: 18 | Checked: Thu 6 Aug 2026 UTC

## Symptom
Booking shows as cancelled.

## Root Cause — live data Thu 6 Aug 2026 UTC (unchanged since 23rd check)

- Booking 1308 (Ana Jessica Rosa de Paula Santos, student 766): CANCELLED, confirmed = false
- Amount paid = EUR 1,530, amount open = null
- Booking last updated 2026-06-07 (60 days ago)

Payments (both xeroPaymentId = null):
- Payment 17186: EUR 1,280, Bank Transfer, paymentDate = 2026-05-01, transactionId = D2026101
- Payment 17050: EUR 250, Bank Transfer, paymentDate = 2026-02-17, transactionId = D2026101 (same txn ID — migration artifact, both imported together)

EUR 1,530 total paid on a CANCELLED booking. Neither payment Xero-reconciled. Neither payment shows as refunded per DB.
Both payments share transactionId D2026101 — Fidelo-era migration where two records were created with the same reference. Total EUR 1,530 is correct.

## Fix Recipe (NOT YET RUN)

Decision needed from Neil / accounts: refund, reallocate, or void?

Option A — Refund EUR 1,530 to student:
  1. Issue refund via Xero or bank for EUR 1,530 (reference booking 1308 / student 766 Ana Jessica)
  2. After refund confirmed: mark payments 17186 + 17050 with xeroPaymentId (refund reference)
  3. Leave booking 1308 as CANCELLED

Option B — Reallocate to a new/active booking for this student:
  1. Identify the new booking ID for Ana Jessica Rosa de Paula Santos (student 766)
  2. UPDATE "Payment" SET "bookingId" = <NEW_BOOKING_ID> WHERE id IN (17186, 17050); -- NOT YET RUN
  3. Recalculate the new booking amountPaid / amountOpen
  4. Reconcile both payments in Xero against the new booking

Either option: reconcile payments 17186 + 17050 in Xero (find EUR 1,530 bank receipts with ref D2026101).

## Risk / Category
money — reversible but requires accounts decision. Blast radius: 1 booking, 2 payments.

## Status
Open — EUR 1,530 paid on cancelled booking 1308, neither payment Xero-reconciled, 60 days since last booking update.
Last checked: Thu 6 Aug 2026 UTC (24th hourly run)