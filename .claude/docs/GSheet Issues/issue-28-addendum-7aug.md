# Issue 28 — Paola Sthefane Moreira: Payment Not Synced (40th check, 7 Aug 2026)
Reporter: PG | Area: Booking / Class | Sheet row: 29 | 40th hrly check Fri 7 Aug 2026 UTC

Root cause (verified Fri 7 Aug 2026 UTC):
- Booking 17850 (Paola Sthefane Missias Moreira, student 14456): status=CONFIRMED, confirmed=false (anomaly)
- amount_paid=null (anomaly), amount_open=EUR 321.35
- Payment 17519: EUR 321.35, Bank, 7 May 2026, booking_id=17850 (linked), xero_payment_id=null — 92 days since payment
- Booking Course 24624 (Morning General, ended 5 Jun 2026): active=true — 63 days stale, 0 class assignments

Fix recipe (NOT YET RUN):

Step 1 — Fix booking fields:
  UPDATE bookings SET confirmed=true, amount_paid=321.35, amount_open=0 WHERE id=17850;

Step 2 — Deactivate stale booking course:
  UPDATE booking_courses SET active=false WHERE id=24624;

Step 3 — Reconcile payment 17519 in Xero:
  Match EUR 321.35 Bank Transfer (7 May 2026) to Xero invoice for booking 17850.

Step 4 — Verify:
  SELECT confirmed, amount_paid, amount_open FROM bookings WHERE id=17850;
  SELECT active FROM booking_courses WHERE id=24624;
  SELECT xero_payment_id FROM payments WHERE id=17519;

Risk: Financial / booking data | Reversible | Single student
Status: NOT RUN | Last checked: Fri 7 Aug 2026 UTC (40th check, 92 days since payment)