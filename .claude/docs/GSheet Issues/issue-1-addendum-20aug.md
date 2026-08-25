Issue 1 status — orphan payments and stale booking courses, 280th check Thu 20 Aug 2026 (late night)
No change since 279th check (evening). DB verified.

Payment 4781: EUR 380, Flywire 2019, booking_id null — legacy orphan, low priority
Payment 16988: EUR 339.90, Bank, 28 Apr 2026, booking_id null — likely Booking 17856 (Margherita Galbusera)
Payment 16989: EUR 339.90, Bank, 28 Apr 2026, booking_id null — likely Booking 17857 (Francesca Fassina)
Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026, booking_id null — leave as-is

Booking Course 24630 (General English AM Plus): active = true, ended 10 Jul 2026 — 41 days stale
Booking Course 24631 (General English AM Plus): active = true, ended 10 Jul 2026 — 41 days stale

Fix NOT RUN

Step 1 link orphan payments:
UPDATE payments SET booking_id = 17856 WHERE id = 16988;
UPDATE payments SET booking_id = 17857 WHERE id = 16989;

Step 2 set confirmed = true:
UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 3 deactivate stale booking courses:
UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 4 Payment 4781 (2019 Flywire orphan): no action; legacy.
Step 5 Payment 17187 (TransferMate Escrow): leave as-is pending resolution.