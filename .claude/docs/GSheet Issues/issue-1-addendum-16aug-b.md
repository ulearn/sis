Issue 1 -- Orphan Payments (Various)
Reporter: NM | Area: Cleanup | Row: 2 | 267th check Sun 16 Aug 2026 UTC
No change from 266th check.

Orphan payments:
  Payment 4781: EUR 380, Flywire 2019, txn D20191404, booking_id=null -- legacy orphan
  Payment 16988: EUR 339.90, Bank 2026-04-28, hubspot 1204827374829, booking_id=null
    -> likely Booking 17856 (Margherita Galbusera, student 14461)
  Payment 16989: EUR 339.90, Bank 2026-04-28, hubspot 1204846469317, booking_id=null
    -> likely Booking 17857 (Francesca Fassina, student 14462)
  Payment 17187: EUR 6151, TransferMate 2026-05-01, ref ULEARNP2026124, booking_id=null
    Booking 480 amount coincidence (2025 service); leave orphaned.

Bookings: 17856 CONFIRMED confirmed=false paid=339.90 total=339.90
          17857 CONFIRMED confirmed=false paid=339.90 total=339.90
Stale BCs: 24630 (bk 17857, ended 10 Jul, active=true) | 24631 (bk 17856, ended 10 Jul, active=true)

FIX RECIPE (NOT YET RUN)
  UPDATE payments SET booking_id=17856 WHERE id=16988;
  UPDATE payments SET booking_id=17857 WHERE id=16989;
  UPDATE bookings SET confirmed=true WHERE id IN (17856,17857);
  UPDATE booking_courses SET active=false WHERE id IN (24630,24631);
  Payment 4781/17187: no action.

Risk: Data hygiene | Reversible: yes | Blast radius: 2 students
Status: Fix NOT RUN. No change since 266th check.
