Issue 20 -- Ariunsarnai Batbayar: EUR 1,509 Unpaid, Day 116 (31st check)

Reporter: PG | Area: Booking/Class | Row: 21 | Check: 31st Thu 6 Aug 2026 UTC

31st hourly check -- no change since 30th. Booking still PENDING, EUR 1,509 fully unpaid, 0 payment records.
Course started 13 Apr 2026 -- now 116 days in with no payment.

== Root cause ==

Booking 1605 (Ariunsarnai Batbayar, student 1047):
- status = PENDING, confirmed = false
- amount_paid = EUR 0, amount_open = EUR 1,509
- 0 payment records in SIS
- Course start: 13 Apr 2026 -- day 116 as of this check

Booking Course 1791 (Academic Year Renewal Morning, ends 23 Oct 2026):
- active = true
- 0 class assignments

== Fix recipe (NOT YET RUN) ==

Step 1 -- Check HubSpot deal linked to booking 1605 for payment status.

Step 2a -- If payment received in HubSpot/Xero but not in SIS:
  INSERT INTO public.payments (booking_id, amount, method, payment_date, transaction_id, data_source)
  VALUES (1605, <amount>, <method>, <date>, <txid>, MANUAL);
  UPDATE public.bookings SET amount_paid = <amount>, amount_open = 1509 - <amount>,
  confirmed = true, status = CONFIRMED WHERE id = 1605;

Step 2b -- If no payment and student not attending:
  UPDATE public.bookings SET status = CANCELLED, confirmed = false WHERE id = 1605;
  UPDATE public.booking_courses SET active = false WHERE id = 1791;

Step 3 -- Verify:
  SELECT id, status, confirmed, amount_paid, amount_open FROM public.bookings WHERE id = 1605;

== Risk / category ==

- Category: bookings, money
- Risk: medium -- confirm HubSpot payment before any DB write
- Reversible: yes | Blast radius: 1 student (Ariunsarnai Batbayar, student 1047)

== Status ==

OPEN -- fix NOT RUN. Day 116 since course start with no payment. Requires HubSpot check first.

Last checked: Thu 6 Aug 2026 UTC (31st hourly check)