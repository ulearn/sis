Issue 17 -- Ana Jessica: EUR 1,530 on Cancelled Booking, Unreconciled (25th check)

Reporter: PG | Area: Booking | Row: 18 | Check: 25th Thu 6 Aug 2026 UTC

25th hourly check -- no change since 24th. Booking 1308 CANCELLED; EUR 1,530 paid via 2 unreconciled payments.
61 days since booking last updated (7 Jun 2026).

== Root cause ==

Booking 1308 (Ana Jessica Rosa de Paula Santos, student 766):
- status = CANCELLED, confirmed = false
- amount_paid = EUR 1,530, amount_open = null

Payment 17186: EUR 1,280, Bank Transfer, paid 1 May 2026, xero_payment_id = null, transaction_id = D2026101
Payment 17050: EUR 250, Bank Transfer, paid 17 Feb 2026, xero_payment_id = null, transaction_id = D2026101 (same ref -- migration artifact)

EUR 1,530 total paid on CANCELLED booking. Neither payment is Xero-reconciled.

== Fix recipe (NOT YET RUN -- requires decision) ==

Decision: refund or reallocate EUR 1,530?

Option A -- Refund EUR 1,530:
  Step 1: Process refund in Xero/bank.
  Step 2: INSERT INTO public.payments (booking_id, amount, method, payment_date, type, comment, data_source)
          VALUES (1308, -1530.00, Bank Transfer, CURRENT_DATE, refund, Refund for cancelled booking, MANUAL);
  Step 3: UPDATE public.bookings SET amount_refund = 1530.00, amount_paid = 0 WHERE id = 1308;

Option B -- Reallocate to new booking:
  Step 1: Identify or create new booking for Ana Jessica.
  Step 2: UPDATE public.payments SET booking_id = <new_booking_id> WHERE id IN (17186, 17050);
  Step 3: Update amounts on both bookings.

Reconcile in Xero (both options):
  Find EUR 1,280 and EUR 250 transfers (txid D2026101, Feb/May 2026) in Xero -- reconcile.
  Then: UPDATE public.payments SET xero_payment_id = <id> WHERE id = 17186;
         UPDATE public.payments SET xero_payment_id = <id> WHERE id = 17050;

== Risk / category ==

- Category: money, bookings
- Risk: medium -- management decision required on refund vs reallocation
- Reversible: refund is irreversible once issued; DB updates reversible
- Blast radius: 1 student (Ana Jessica Rosa de Paula Santos, student 766)

== Status ==

OPEN -- fix NOT RUN. Awaiting decision: refund or reallocate EUR 1,530. 61 days since last update.

Last checked: Thu 6 Aug 2026 UTC (25th hourly check)