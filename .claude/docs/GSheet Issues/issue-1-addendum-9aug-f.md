# Issue 1 Addendum — 204th check — Sun 9 Aug 2026 UTC

Reporter: NM | Area: Cleanup | Row 2

Orphaned payments (booking_id = null) — all unchanged:
- Payment 4781: EUR 380, Flywire, 20 Aug 2019, xeroPaymentId = null
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 (103 days), xeroPaymentId = null
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 (103 days), xeroPaymentId = null
- Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026 (100 days), xeroPaymentId = null

Bookings with 0 payments linked:
- Booking 17856: CONFIRMED, confirmed=false, amountPaid=339.90, amountTotal=339.90, amountOpen=null, 0 payments
- Booking 17857: CONFIRMED, confirmed=false, amountPaid=339.90, amountTotal=339.90, amountOpen=null, 0 payments

Stale BCs (active=true, ended 10 Jul 2026 — 30 days stale):
- BC 24630: General English AM Plus -> booking 17856
- BC 24631: General English AM Plus -> booking 17857

FIX RECIPE (NOT YET RUN):
1. UPDATE payments SET booking_id = 17856 WHERE id = 16988;
2. UPDATE payments SET booking_id = 17857 WHERE id = 16989;
3. UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);
4. UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);
5. Payment 4781 (EUR 380 Flywire 2019): manual investigation, pre-migration orphan.
6. Payment 17187 (EUR 6,151 TM Escrow): manual investigation, was escrow matched?

Risk: Steps 1-4 low/reversible/data-hygiene. Steps 5-6 need manual check first.
Status: Open, fix NOT RUN. 204th check, unchanged since 203rd.
Last checked: Sun 9 Aug 2026 UTC