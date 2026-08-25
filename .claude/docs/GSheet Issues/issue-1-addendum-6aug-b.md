# Issue 1 — Orphan Payments + Stale Booking Courses (160th check)

Reporter: NM | Area: Cleanup | Row: 2 | Check: 160th Thu 6 Aug 2026 UTC

160th hourly check — all items unchanged since 159th run.

## Root cause

4 orphan payments (booking_id = null):
- Payment 4781: EUR 380, 20 Aug 2019 (legacy orphan, 7+ years, txid D20191404)
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 (100 days orphaned)
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 (100 days orphaned)
- Payment 17187: EUR 6,151, TransferMate, 1 May 2026, txid D2026226 (97 days orphaned)

Bookings with confirmed = false despite CONFIRMED status:
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed = false, amount_paid = EUR 339.90
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed = false, amount_paid = EUR 339.90
  Note: amountPaid shows EUR 339.90 but payments 16988/16989 still have bookingId = null
  The amountPaid field and the payment record link are inconsistent — both need fixing

Stale booking courses (active = true, end_date in past):
- Booking Course 24630 (General English AM Plus, booking 17857): ended 10 Jul 2026, 27 days stale
- Booking Course 24631 (General English AM Plus, booking 17856): ended 10 Jul 2026, 27 days stale
- Booking Course 25006 (General English AM Plus, booking 18228): ended 3 Aug 2026, 3 days stale

## Fix recipe (NOT YET RUN)

Step 1 — Link payment 16988 to booking 17856:
  UPDATE public.payments SET booking_id = 17856 WHERE id = 16988;

Step 2 — Link payment 16989 to booking 17857:
  UPDATE public.payments SET booking_id = 17857 WHERE id = 16989;

Step 3 — Fix confirmed = false for both bookings:
  UPDATE public.bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 4 — Deactivate stale booking courses:
  UPDATE public.booking_courses SET active = false WHERE id IN (24630, 24631, 25006);

Step 5 — Payment 17187 (EUR 6,151 TransferMate escrow): check Hub fins/ for reconciliation status.
  If reconciled: UPDATE public.payments SET booking_id = ID, xero_payment_id = XID WHERE id = 17187;

Step 6 — Payment 4781 (legacy orphan, 2019): low priority, review and write off or archive.

## Risk / category

- Category: accounts, data-hygiene
- Steps 1-4: low risk, reversible
- Step 5: medium — verify correct booking_id before linking EUR 6,151
- Blast radius: 2 students (bookings 17856/17857), 3 booking courses

## Status

OPEN — fix NOT RUN. Orphan payments 100 days outstanding.

Last checked: Thu 6 Aug 2026 UTC (160th hourly check)
