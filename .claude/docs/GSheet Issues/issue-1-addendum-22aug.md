# Issue 1 Addendum 22 Aug 2026 — Orphan Payments / Stale Booking Courses

Reporter: NM | Area: Cleanup | Sheet row: 2

Root cause (288th check, Sat 22 Aug 2026 UTC — no change since 287th Fri 21 Aug ~19:00 UTC):

Orphan payments (unchanged):
  Payment 16988: EUR 339.90, Bank, 28 Apr 2026, bookingId = null
  Payment 16989: EUR 339.90, Bank, 28 Apr 2026, bookingId = null
  Payment 17187: EUR 6,151, TransferMate Escrow — leave as-is
  Payment 4781: EUR 380, Flywire 2019 — legacy, low priority

Bookings (unchanged):
  Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amountPaid=EUR 339.90, zero Payment records linked
  Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false, amountPaid=EUR 339.90, zero Payment records linked

Stale Booking Courses (now 43 days stale):
  BC 24630 (General English AM Plus, booking 17857): ended 10 Jul 2026, active=true
  BC 24631 (General English AM Plus, booking 17856): ended 10 Jul 2026, active=true

Fix recipe (NOT YET RUN) — Option A (preferred):
  UPDATE payments SET booking_id = 17856 WHERE id = 16989;
  UPDATE payments SET booking_id = 17857 WHERE id = 16988;
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Option B (if amountPaid was set in error):
  UPDATE bookings SET amount_paid = 0 WHERE id IN (17856, 17857);

Risk: money/bookings | Reversible: yes | Blast radius: 2 bookings, 2 payments, 2 students.
Status: OPEN, fix NOT RUN.
Last checked: 2026-08-22 Sat UTC (288th check)
