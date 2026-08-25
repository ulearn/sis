# Issue 1 — Orphan Payments (178th check, 7 Aug 2026)
Reporter: Various / System | Area: Cleanup | Sheet row: 2 | 178th hrly check Fri 7 Aug 2026 UTC

Root cause: 4 orphan payments unchanged. Booking 17857 student confirmed as Francesca Fassina (student 14462).

Evidence (Fri 7 Aug 2026 UTC):
- Payment 4781: EUR 380, Flywire, 20 Aug 2019 (~2,549 days orphaned)
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 (~101 days orphaned, booking_id=null, xero_payment_id=null)
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 (~101 days orphaned, booking_id=null, xero_payment_id=null)
- Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026 (~98 days orphaned, xero_payment_id=null)
- Booking 17856: student = Margherita Galbusera, CONFIRMED, confirmed=false, amount_paid=EUR 339.90, 0 payments directly linked
- Booking 17857: student = Francesca Fassina (student 14462), CONFIRMED, confirmed=false, amount_paid=EUR 339.90, 0 payments directly linked
- Booking Course 24631 (General English AM Plus, ended 10 Jul 2026): active=true, 28 days stale (bk17856)
- Booking Course 24630 (General English AM Plus, ended 10 Jul 2026): active=true, 28 days stale (bk17857)

Note: Payments 16988/16989 (EUR 339.90 each) match amount_paid on bookings 17856/17857 exactly.
Note: Also tracked in Issue 48 (Fassina/Fassini name question re student 14462).

Fix recipe (NOT YET RUN):
1. Verify: bk 17856 = Margherita Galbusera; bk 17857 = Francesca Fassina (student 14462)
2. UPDATE payments SET booking_id=17856 WHERE id=16988;
3. UPDATE payments SET booking_id=17857 WHERE id=16989;
4. UPDATE bookings SET confirmed=true, amount_paid=339.90, amount_open=0 WHERE id IN (17856, 17857);
5. UPDATE booking_courses SET active=false WHERE id IN (24630, 24631);
6. Payment 17187 EUR 6,151: identify booking via TransferMate/HubSpot first
7. Payment 4781 EUR 380 (2019): Neil to decide write-off or leave

Risk: Financial. Reversible. Status: UNRESOLVED | Last checked: Fri 7 Aug 2026 UTC