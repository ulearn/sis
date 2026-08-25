# Issue 28 - Paola Moreira: confirmed=false + amountPaid=null despite linked payment (36th check)

Reporter: | Area: Booking/Class | Row: 29 | Check: 36th Thu 6 Aug 2026 UTC

## Symptom
Student appears in class but cannot be assigned - system says payment not received.

## Root cause (36th check Thu 6 Aug UTC - unchanged)

Booking 17850 (Paola Sthefane Missias Moreira, student 14456):
- status = CONFIRMED, confirmed = false (anomaly)
- amount_paid = null, amount_open = EUR 321.35
- Booking last updated 2026-07-08 (29 days ago)

Payment 17519:
- amount = EUR 321.35, method = Bank, payment_date = 2026-05-07
- booking_id = 17850 (CORRECTLY LINKED to booking)
- xero_payment_id = null (unreconciled, 91 days)
- Sum of all payments on booking 17850 = EUR 321.35

Root cause: Payment 17519 is correctly linked (bookingId = 17850) and covers the full amount_open.
The booking aggregate fields (amount_paid, confirmed) were never recalculated after payment was created.

## Fix recipe (NOT YET RUN)

Step 1 - Confirm payment sum:
  SELECT SUM(amount) FROM public.payments WHERE booking_id = 17850;
  -- Expected: 321.35 = amount_open

Step 2 - Update booking aggregate fields:
  p.booking.update({ where: { id: 17850 }, data: { confirmed: true, amountPaid: 321.35, amountOpen: 0 } })

Step 3 - Deactivate stale booking course 24624 (ended Jun 5, 62d stale):
  p.bookingCourse.update({ where: { id: 24624 }, data: { active: false } })

Step 4 - Xero reconciliation for payment 17519:
  Find EUR 321.35 Bank receipt ~May 7 2026 for Paola Moreira / booking 17850.
  UPDATE public.payments SET xero_payment_id = '<XERO_ID>' WHERE id = 17519;

## Risk
Money/Bookings: low risk, reversible. Confirms existing payment.
Blast radius: 1 booking, 1 payment, 1 booking course.

## Status
OPEN - fix NOT RUN. 92 days since payment; booking still shows unconfirmed/unpaid.
Last checked: Thu 6 Aug 2026 UTC (36th hourly check)
