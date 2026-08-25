Issue 15 - Saikhantes Shagdarsuren: service_end expired - 81st check Sun 9 Aug 2026 UTC
Sheet row: 16

ROOT CAUSE:
Booking 18151: service_end = 2026-08-07, expired 2 days ago.
BC 24925 (AY Afternoon, 2026-03-09 to 2026-10-02, active=true).
CONFIRMED, confirmed=true, EUR 1339.20 paid, EUR 0 open.
Payment 17872: EUR 1339.20, Bank, 2025-12-19, xero_payment_id=null.

Student fully paid and correctly enrolled through Oct 2.
service_end simply not updated when BC 24925 end date was set.
Secondary: payment 17872 xero_payment_id=null - needs separate Xero reconciliation.

FIX RECIPE (NOT YET RUN):
Step 1 (urgent):
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;
  Verify: SELECT id, service_end FROM bookings WHERE id = 18151;

Step 2 (lower priority - Xero):
  Find or create Xero payment for EUR 1339.20 Bank Transfer 2025-12-19.
  UPDATE payments SET xero_payment_id = '<xero-id>' WHERE id = 17872;

RISK: bookings/data-hygiene | Reversible: yes | Blast: 1 booking.
STATUS: NOT RUN
Last checked: 2026-08-09 UTC (81st check)