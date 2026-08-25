Issue 15 - Saikhantes Shagdarsuren: service_end expired - 82nd check Sun 9 Aug 2026 UTC
Sheet row: 16

STATUS: UNCHANGED. Data confirmed by fresh DB query this run.

ROOT CAUSE (confirmed):
Booking 18151 (Saikhantes Shagdarsuren): CONFIRMED, confirmed=true, EUR 1,339.20 paid, EUR 0 open.
service_end = 2026-08-07 - expired 2 days ago. Not updated when BC end date was set.
Booking Course 24925 (Academic Year Afternoon, 2026-03-09 to 2026-10-02): active=true.
Payment 17872: EUR 1,339.20, Bank Transfer, 2025-12-19, xero_payment_id=null (Xero not reconciled).

FIX RECIPE (NOT YET RUN):
Step 1 (urgent):
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;
  Verify: SELECT id, service_end FROM bookings WHERE id = 18151;

Step 2 (lower priority - Xero):
  Find or create Xero payment for EUR 1,339.20 Bank Transfer 2025-12-19.
  UPDATE payments SET xero_payment_id = '<xero-id>' WHERE id = 17872;

RISK: bookings/data-hygiene | Reversible: yes | Blast: 1 booking.
STATUS: NOT RUN
Last checked: 2026-08-09 UTC (82nd check - data confirmed by fresh query)
