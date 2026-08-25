# Issue 1 — Orphan Payments + Booking Anomalies (185th check, 8 Aug 2026)

Reporter: NM | Area: Cleanup | Sheet row: 2 | Check: 185th hourly — Sat 8 Aug 2026 UTC

## Symptom
Orphan payments (booking_id = null, amount > 0); confirmed=false on CONFIRMED bookings; stale Booking Courses.

## Root Cause (verified live, 8 Aug 2026)

Orphan payments — all 4 unchanged:
  Payment 4781:  EUR 380,    Flywire,             payment_date 2019-08-20 (legacy Fidelo, ~2,545 days orphaned)
  Payment 16988: EUR 339.90, Bank,                payment_date 2026-04-28 (102 days orphaned, xero_payment_id=null)
  Payment 16989: EUR 339.90, Bank,                payment_date 2026-04-28 (102 days orphaned, xero_payment_id=null)
  Payment 17187: EUR 6,151,  TransferMate Escrow, payment_date 2026-05-01 (99 days orphaned, xero_payment_id=null)

Booking anomalies — unchanged:
  Booking 17856 (Margherita Galbusera):  CONFIRMED, confirmed=false, amount_paid=EUR 339.90 (fully paid)
  Booking 17857 (Francesca Fassina):     CONFIRMED, confirmed=false, amount_paid=EUR 339.90 (fully paid)

Stale Booking Courses — 29 days stale:
  BC 24630 (General English AM Plus, booking 17856): end_date=2026-07-10, active=true
  BC 24631 (General English AM Plus, booking 17857): end_date=2026-07-10, active=true

## Fix Recipe (NOT YET RUN)

Step 1 — Link orphan payments to bookings:
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;

Step 2 — Set confirmed=true on both bookings:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 3 — Deactivate stale Booking Courses:
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 4 — Payment 17187 (EUR 6,151 TransferMate Escrow): Neil must identify the target booking before linking.
Step 5 — Payment 4781 (EUR 380 Flywire legacy, 2019): probable write-off; Neil decision needed.

Verify after all steps:
  SELECT id, booking_id, amount FROM payments WHERE id IN (16988, 16989, 17187, 4781);
  SELECT id, confirmed, amount_paid FROM bookings WHERE id IN (17856, 17857);
  SELECT id, active FROM booking_courses WHERE id IN (24630, 24631);

## Risk / Category
Money (EUR 6,870.80 in orphan payments) + Bookings + Data hygiene. All steps reversible.
Payment 17187 needs manual booking identification before linking.

## Status
Open — Fix NOT RUN. Last checked: Sat 8 Aug 2026 UTC (185th hourly run)