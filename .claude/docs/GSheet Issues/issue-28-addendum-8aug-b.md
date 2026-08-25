Issue 28 -- Paola Sthefane Moreira (44th check, 8 Aug 2026)
Reporter: Staff | Area: Booking/Class | Sheet row: 29

Root cause (44th check Sat 8 Aug 2026 UTC):
Note: B/F/G hash changed in sheet since last run -- column G was likely edited.
- Booking 17850 (Paola Sthefane Missias Moreira): CONFIRMED, confirmed=false (anomaly)
- amount_paid=null, amount_open=EUR 321.35, amount_total=EUR 321.35
- Payment 17519: EUR 321.35, Bank, 7 May 2026 -- linked to booking 17850, xero_payment_id=null
- NEW: Booking Course 24624 (Morning General, 18 May to 5 Jun 2026): active=true, 64 days stale
- Root: booking confirmed + amount_paid not updated after payment was linked

Fix (NOT YET RUN):
  UPDATE bookings SET confirmed=true, amount_paid=321.35, amount_open=0 WHERE id=17850;
  UPDATE booking_courses SET active=false WHERE id=24624;
  SELECT confirmed, amount_paid, amount_open FROM bookings WHERE id=17850;
  SELECT active FROM booking_courses WHERE id=24624;
Also: check if payment 17519 needs xero_payment_id set.

Category: Bookings/money | Reversible: Yes | Blast: 1 student
Last checked: 2026-08-08 UTC (44th check)