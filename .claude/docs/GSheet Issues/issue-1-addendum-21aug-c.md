Issue 1 addendum - Orphan Payments / Stale Booking Courses - Fri 21 Aug 2026 19:00 UTC
NEW FINDING: Bookings 17856 and 17857 show amountPaid = EUR 339.90 in Booking record
but zero Payment records are linked in the Payment table. Field was set directly.
Same anomaly pattern as Issue 48 (booking 1624).

Orphan payments (unchanged):
  Payment 16988: EUR 339.90, Bank, 28 Apr 2026, bookingId = null
  Payment 16989: EUR 339.90, Bank, 28 Apr 2026, bookingId = null
  Payment 17187: EUR 6,151, TransferMate Escrow - leave as-is
  Payment 4781: EUR 380, Flywire 2019 - legacy, low priority

Bookings (updated detail):
  Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amountPaid=339.90, zero Payment records linked
  Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false, amountPaid=339.90, zero Payment records linked

Stale Booking Courses (42 days stale):
  BC 24630 (General English AM Plus, booking 17857): ended 10 Jul 2026, active = true
  BC 24631 (General English AM Plus, booking 17856): ended 10 Jul 2026, active = true

Fix NOT YET RUN (Option A - preferred):
  UPDATE Payment SET bookingId = 17856 WHERE id = 16989
  UPDATE Payment SET bookingId = 17857 WHERE id = 16988
  UPDATE BookingCourse SET active = false WHERE id IN (24630, 24631)

Option B (if amountPaid set in error):
  UPDATE Booking SET amountPaid = 0 WHERE id IN (17856, 17857)
  Then reassign payments to correct bookings

Risk: Money/Bookings, reversible, 2 bookings, 2 payments, 2 students.
Last checked: Fri 21 Aug 2026 ~19:00 UTC