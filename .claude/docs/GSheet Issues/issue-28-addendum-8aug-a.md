# Issue 28 — Paola Sthefane Moreira: Booking Confirmed False, Stale BC (42nd check)

Reporter: Various | Area: Booking / Class | Row: 29 | Check: 42nd Sat 8 Aug 2026 UTC

42nd hourly check. CORRECTION: previous check recorded payment date as 23 May 2026.
DB confirms actual paymentDate = 7 May 2026 — 93 days (not 76). Date corrected.

## Root cause

- Booking 17850 (Paola Sthefane Missias Moreira, student 14456): CONFIRMED, confirmed = false (anomaly)
- Amount paid = null on booking, amount open = EUR 321.35 — payment exists but not applied to booking
- Payment 17519: EUR 321.35, Bank, 7 May 2026, linked to booking 17850, xeroPaymentId = null (93 days)
- Booking Course 24624 (Morning General): ended 5 Jun 2026, active = true — 64 days stale

## Fix recipe (NOT YET RUN)

Step 1: Update booking 17850:
  UPDATE public.bookings SET confirmed = true, amount_paid = 321.35, amount_open = 0 WHERE id = 17850;

Step 2: Deactivate stale BC 24624:
  UPDATE public.booking_courses SET active = false WHERE id = 24624 AND end_date < NOW();

Step 3: Reconcile payment 17519 in Xero:
  Match EUR 321.35 Bank Transfer (7 May 2026) to Xero invoice for booking 17850.

Verify:
  SELECT id, confirmed, amount_paid, amount_open FROM public.bookings WHERE id = 17850;
  SELECT id, active FROM public.booking_courses WHERE id = 24624;
  SELECT id, xero_payment_id FROM public.payments WHERE id = 17519;

## Risk / category

- Category: bookings / money | Low risk, reversible
- Blast radius: 1 student (Paola Moreira), 1 booking, 1 payment

## Status

OPEN — fix NOT RUN. Payment 17519 (7 May, EUR 321.35) unreconciled 93 days. BC24624 stale 64 days.
Last checked: Sat 8 Aug 2026 UTC (42nd hourly check)
