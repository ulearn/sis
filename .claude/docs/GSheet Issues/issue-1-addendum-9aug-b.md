# Issue 1 — Orphan Payments (Addendum 9 Aug-b)

**Check:** 197th Sun 9 Aug 2026 UTC | **Row:** 2 | Unchanged

## Status (fresh query, 9 Aug 2026 — no change)

Orphan payments (bookingId = null):
  Payment 4781: EUR 380, Flywire, Aug 2019 (~2,550 days orphaned)
  Payment 16988: EUR 339.90, Bank, 28 Apr 2026 (104 days orphaned)
  Payment 16989: EUR 339.90, Bank, 28 Apr 2026 (104 days orphaned)
  Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026 (100 days orphaned)

Bookings with mismatched payment state:
  Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amountPaid=339.90, 0 payments linked
  Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false, amountPaid=339.90, 0 payments linked
  Booking Courses 24630+24631 (General English AM Plus, ended Jul 10 2026): active=true (30 days stale)

Full fix recipe: issue-1-orphan-payments.md. Fix NOT RUN.

Status: Open. Last checked: 2026-08-09 UTC (197th check)