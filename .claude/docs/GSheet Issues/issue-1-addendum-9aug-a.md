Issue 1 (195th check Sun 9 Aug 2026) -- Sheet row 2

Orphan payments (booking_id = null) -- unchanged:
  Payment 4781: EUR 380, Flywire, 20 Aug 2019 (~2,549 days orphaned)
  Payment 16988: EUR 339.90, Bank, 28 Apr 2026 (103 days orphaned)
  Payment 16989: EUR 339.90, Bank, 28 Apr 2026 (103 days orphaned)
  Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026 (100 days orphaned)

Booking anomalies:
  Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false -- EUR 339.90 paid, 0 payments linked
  Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false -- EUR 339.90 paid, 0 payments linked

Stale booking courses:
  BC 24630 (General English AM Plus): ended 10 Jul 2026, active=true -- 30 days stale
  BC 24631 (General English AM Plus): ended 10 Jul 2026, active=true -- 30 days stale

Fix recipe (NOT YET RUN):
  UPDATE payments SET booking_id=17856 WHERE id=16988;
  UPDATE bookings SET confirmed=true, amount_paid=339.90, amount_open=0 WHERE id=17856;
  UPDATE payments SET booking_id=17857 WHERE id=16989;
  UPDATE bookings SET confirmed=true, amount_paid=339.90, amount_open=0 WHERE id=17857;
  UPDATE booking_courses SET active=false WHERE id IN (24630,24631);
  Payment 17187: confirm booking then link. Payment 4781: confirm with Neil (archive/write-off).

Risk: Money + data hygiene. Reversible. Blast: 2 students.
Status: NOT RUN | Last checked: 2026-08-09 UTC (195th check)
