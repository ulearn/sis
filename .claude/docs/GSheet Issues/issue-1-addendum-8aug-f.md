Issue 1 -- Orphan Payments (193rd check, 8 Aug 2026)
Reporter: NM | Area: Cleanup | Sheet row: 2

Orphan payments (bookingId = null):
  16988: EUR 339.90, Bank, 2026-04-28 (102 days) -> link to booking 17856 (Margherita Galbusera)
  16989: EUR 339.90, Bank, 2026-04-28 (102 days) -> link to booking 17857 (Francesca Fassina)
  17187: EUR 6,151, TransferMate Escrow, 2026-05-01 (99 days) -> identify booking before linking
  4781: EUR 380, Flywire, 2019-08-20 (~2547 days, legacy Fidelo) -> likely write-off, confirm with Neil

Unlinked bookings:
  17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amountPaid=EUR 339.90
  17857 (Francesca Fassina): CONFIRMED, confirmed=false, amountPaid=EUR 339.90

Stale BCs:
  24630: active=true, ended 2026-07-10 (29 days stale)
  24631: active=true, ended 2026-07-10 (29 days stale)

Unchanged from previous check.

Fix (NOT YET RUN):
UPDATE payments SET booking_id = 17856 WHERE id = 16988;
UPDATE payments SET booking_id = 17857 WHERE id = 16989;
UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);
UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);
-- Payment 17187: identify target booking first
-- Payment 4781: confirm write-off with Neil

Category: Money/data hygiene | Reversible: Yes | Blast: 4 payments, 2 bookings, 2 BCs
Last checked: 2026-08-08 UTC (193rd check)