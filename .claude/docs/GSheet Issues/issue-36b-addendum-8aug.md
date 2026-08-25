# Issue 36b — Pietro Caccianiga + Paola Moreira: Payments Unreconciled (152nd check)

Reporter: Diego | Area: Booking / Accommodation | Row: 38 | Check: 152nd Sat 8 Aug 2026 UTC

152nd hourly check — no change. Pietro payment 67d unreconciled. Paola 93d.
Pietro BC 24772 ends in 13 days (21 Aug 2026) — flag for deactivation.

## Root cause

Pietro Caccianiga (booking 17980):
- Booking 17980: CONFIRMED, confirmed = true, fully paid EUR 5,331, amount open EUR 0
- Payment 17733: EUR 5,331, Bank, 2 Jun 2026, xeroPaymentId = null — 67 days unreconciled
- Booking Course 24772 (General English AM, 29 Jun to 21 Aug 2026): active, ends in 13 days

Paola Sthefane Moreira (see also Issue 28, row 29):
- Payment 17519: EUR 321.35, Bank, 7 May 2026, xeroPaymentId = null — 93 days unreconciled
- Booking 17850: confirmed = false, amount_paid = null — payment linked but not applied to booking
- Booking Course 24624 (Morning General): ended 5 Jun 2026, active = true — 64 days stale

## Fix recipe (NOT YET RUN)

Pietro Step 1: Reconcile payment 17733 in Xero:
  Match EUR 5,331 Bank Transfer (2 Jun 2026) to Xero invoice for booking 17980.

Pietro Step 2: Deactivate BC 24772 on/after 22 Aug 2026:
  UPDATE public.booking_courses SET active = false WHERE id = 24772;

Paola Step 3: Update booking 17850:
  UPDATE public.bookings SET confirmed = true, amount_paid = 321.35, amount_open = 0 WHERE id = 17850;

Paola Step 4: Deactivate stale BC 24624:
  UPDATE public.booking_courses SET active = false WHERE id = 24624 AND end_date < NOW();

Paola Step 5: Reconcile payment 17519 in Xero:
  Match EUR 321.35 Bank Transfer (7 May 2026) to Xero invoice for booking 17850.

Verify:
  SELECT id, xero_payment_id FROM public.payments WHERE id IN (17733, 17519);
  SELECT id, confirmed, amount_paid FROM public.bookings WHERE id IN (17980, 17850);
  SELECT id, active, end_date FROM public.booking_courses WHERE id IN (24772, 24624);

## Risk / category

- Category: money / data-hygiene | Low risk, reversible
- Blast radius: 2 students (Pietro Caccianiga, Paola Moreira), 2 payments, 2 bookings

## Status

OPEN — fix NOT RUN. Pietro pmt 17733 unreconciled 67d. BC24772 ends 21 Aug (deactivate then).
Paola pmt 17519 unreconciled 93d; booking anomalies unchanged.
Last checked: Sat 8 Aug 2026 UTC (152nd hourly check)
