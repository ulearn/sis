# Issue 41 — Giampaolo Russo: Capel Apartment Unassigned + Xero (22nd check)

Reporter: Diego | Area: Booking / Accommodation | Row: 43 | Check: 22nd Sat 8 Aug 2026 UTC

22nd hourly check — no change. Check-in 29 days away (6 Sep 2026).

## Root cause

- Booking accommodation 11357 (Host Family, bed 178, Claremont Close, 2 Aug to 6 Sep 2026): active, checked in 6 days ago. OK.
- Booking accommodation 11392 (City Centre Apartment, 6 Sep to 14 Sep 2026): bed_id = null. Check-in 29 days. Fee EUR 415.
- Payment 17954: EUR 2,584.96, Bank, 26 Jun 2026, xeroPaymentId = null — 43 days unreconciled. Linked to booking 18180.

## Fix recipe (NOT YET RUN)

Step 1: Assign bed to BA 11392 in SIS Admin:
  Accommodation > booking 18180 > BA 11392 > assign available city-centre apartment bed (6 Sep to 14 Sep 2026).

Step 2: Reconcile payment 17954 in Xero:
  Match EUR 2,584.96 Bank Transfer (26 Jun 2026) to Xero invoice for booking 18180.

Verify:
  SELECT id, bed_id, active FROM public.booking_accommodations WHERE id = 11392;
  SELECT id, xero_payment_id FROM public.payments WHERE id = 17954;

## Risk / category

- Category: accommodation / money | Moderate urgency (29 days to check-in)
- Reversible | Blast radius: 1 student (Giampaolo Russo)

## Status

OPEN — fix NOT RUN. BA 11392 bed_id null (Sep 6 check-in, 29 days away). Payment 17954 Xero null 43 days.
Last checked: Sat 8 Aug 2026 UTC (22nd hourly check)
