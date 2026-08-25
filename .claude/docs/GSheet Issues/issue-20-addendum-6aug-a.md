# Issue 20 — Ariunsarnai Batbayar: EUR 1,509 Unpaid (30th check)

Reporter: Various | Area: Booking / Class | Row: 21 | Check: 30th Thu 6 Aug 2026 UTC

30th hourly check — day 115 since course start, still no payment.

## Root cause

Booking 1605 (student 1047, Ariunsarnai Batbayar):
- status = PENDING, confirmed = false
- amount_paid = EUR 0, amount_open = EUR 1,509 — fully unpaid, 0 payment records
- service_end = 2026-10-23

Booking Course 1791 (Academic Year Renewal Morning):
- ends 23 Oct 2026, active = true, 0 class assignments
- Course started 13 Apr 2026 — 115 days ago

## Fix recipe (NOT YET RUN)

Step 1 — Check HubSpot for payment status on this deal.

Step 2a — If payment received: record it and confirm booking.
  INSERT INTO public.payments (booking_id, amount, type, payment_date)
  VALUES (1605, 1509, TYPE, DATE);
  UPDATE public.bookings SET confirmed = true WHERE id = 1605;

Step 2b — If student never enrolled or no payment expected: cancel booking.
  UPDATE public.bookings SET status = CANCELLED WHERE id = 1605;
  UPDATE public.booking_courses SET active = false WHERE id = 1791;

## Risk / category

- Category: accounts, bookings
- Reversible, but check HubSpot first
- Blast radius: 1 student

## Status

OPEN — fix NOT RUN. Day 115 outstanding. Requires HubSpot check before any action.

Last checked: Thu 6 Aug 2026 UTC (30th hourly check)
