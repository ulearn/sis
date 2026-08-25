Issue 1 -- Orphan Payments (194th check, 8 Aug 2026)
Reporter: NM | Area: Cleanup | Sheet row: 2

Unchanged from 193rd check. All 4 orphan payments remain unlinked.

Orphan payments (booking_id = null):
  Payment 16988: EUR 339.90, Bank, 2026-04-28 (102 days) -- link to booking 17856 (Margherita Galbusera)
  Payment 16989: EUR 339.90, Bank, 2026-04-28 (102 days) -- link to booking 17857 (Francesca Fassina)
  Payment 17187: EUR 6,151, TransferMate Escrow, 2026-05-01 (99 days) -- identify booking before linking
  Payment 4781: EUR 380, Flywire, 2019-08-20 (~2548 days, legacy Fidelo) -- confirm write-off with Neil

Unlinked bookings:
  Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed = false, amount paid = EUR 339.90, 0 payments linked
  Booking 17857 (Francesca Fassina): CONFIRMED, confirmed = false, amount paid = EUR 339.90, 0 payments linked

Stale booking courses:
  Booking Course 24630: active = true, ended 2026-07-10 (29 days stale), booking 17856
  Booking Course 24631: active = true, ended 2026-07-10 (29 days stale), booking 17857

Fix recipe (NOT YET RUN):
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);
  -- Payment 17187: identify target booking first (EUR 6,151 TransferMate Escrow)
  -- Payment 4781: confirm write-off with Neil (2019 legacy Fidelo)

Risk: Money/data hygiene | Reversible | Blast: 4 payments, 2 bookings, 2 booking courses

Status: NOT RUN
Last checked: 2026-08-08 UTC (194th check)
