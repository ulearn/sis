Issue 1 - Orphan Payments (179th check, 7 Aug 2026)
Reporter: Various / System | Sheet row: 2

Root Cause (verified live - unchanged from 178th check):
- Payment 4781: EUR 380, Flywire, 20 Aug 2019 (legacy Fidelo, ~2,549 days orphaned)
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 (~101 days orphaned, booking_id=null, xero=null)
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 (~101 days orphaned, booking_id=null, xero=null)
- Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026 (~98 days orphaned, xero=null)
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amount_paid=EUR 339.90, 0 payments linked
- Booking 17857 (Francesca Fassina, student 14462): CONFIRMED, confirmed=false, amount_paid=EUR 339.90, 0 payments linked
- Booking Courses 24630 and 24631 (General English AM Plus, ended Jul 10 2026): active, 28 days stale

Fix Recipe (NOT YET RUN):
1. Verify bk17856 = Margherita Galbusera; bk17857 = Francesca Fassina (student 14462)
2. UPDATE payments SET booking_id=17856 WHERE id=16988;
3. UPDATE payments SET booking_id=17857 WHERE id=16989;
4. UPDATE bookings SET confirmed=true, amount_paid=339.90, amount_open=0 WHERE id IN (17856, 17857);
5. UPDATE booking_courses SET active=false WHERE id IN (24630, 24631);
6. Payment 17187 EUR 6,151: identify booking via TransferMate/HubSpot before linking
7. Payment 4781 EUR 380 (2019): Neil to decide write-off or leave

Risk: Financial | Reversible | See also: Issue 48 (Fassina/Fassini identity)
Status: UNRESOLVED | Last checked: Fri 7 Aug 2026 UTC (179th check)
