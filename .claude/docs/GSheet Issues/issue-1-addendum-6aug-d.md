Issue 1 — Orphan Payments and Unlinked Bookings 17856/17857 (164th check)
Reporter: NM | Area: Cleanup | Row: 2 | Check: 164th Thu 6 Aug 2026 UTC

164th hourly check — orphan payments and bookings 17856/17857 unchanged.

Root cause

4 orphan payments (booking_id = null):
- Payment 4781: EUR 380, Flywire, created 10 Apr 2026 (Fidelo legacy, 118 days orphaned)
- Payment 16988: EUR 339.90, Bank, created 28 Apr 2026 (101 days orphaned)
- Payment 16989: EUR 339.90, Bank, created 28 Apr 2026 (101 days orphaned)
- Payment 17187: EUR 6,151, TransferMate Escrow, created 5 May 2026 (93 days orphaned, txid D2026226)

Bookings with amount_paid set but 0 payment records linked:
- Booking 17856 (Margherita Galbusera, student 14461): amount_paid = EUR 339.90, confirmed = false
- Booking 17857 (Francesca Fassina, student 14462): amount_paid = EUR 339.90, confirmed = false
- Orphan payments 16988/16989 (EUR 339.90 each) almost certainly belong to these bookings

Manual Jul 8 update set amount_paid on 17856/17857 but did not link payment records or set confirmed = true.

Fix recipe (NOT YET RUN)

Step 1 — Link orphan payments to bookings:
  UPDATE public.payments SET booking_id = 17857 WHERE id = 16988;
  UPDATE public.payments SET booking_id = 17856 WHERE id = 16989;

Step 2 — Set confirmed = true:
  UPDATE public.bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 3 — Deactivate stale booking courses:
  UPDATE public.booking_courses SET active = false WHERE id IN (24630, 24631);

Step 4 — Investigate payment 17187 (EUR 6,151 TransferMate Escrow):
  Check TransferMate/Xero for matching booking. May belong to a different student.

Step 5 — Treat payment 4781 (EUR 380 Flywire) as Fidelo legacy:
  Consult Neil — may be safe to archive or delete.

Risk / category
- Category: money, data integrity
- Steps 1-3: medium risk — verify booking/payment amounts match before linking
- Blast radius: 2 students (Galbusera 14461, Fassina 14462) + financial records

Status: OPEN — fix NOT RUN. 101 days orphaned for payments 16988/16989.

Last checked: Thu 6 Aug 2026 UTC (164th hourly check)