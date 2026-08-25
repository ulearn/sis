Issue 28 - Paola Sthefane Moreira booking confirmed=false (54th check)
Reporter: NM | Area: Booking/Class | Sheet row: 29 | Sun 16 Aug 2026 UTC

Root Cause (54th check - 16 Aug 2026 UTC)
- Booking 17850 (Paola Sthefane Missias Moreira): status = CONFIRMED, confirmed = false - anomaly
- Amount paid = null, amount open = EUR 321.35, amount total = EUR 321.35
- Payment 17519: EUR 321.35, Bank, May 7 2026 - xeroPaymentId = null (101 days unreconciled)
- Booking last updated: Jul 8 2026 (39 days ago) - no recent changes in DB

Fix Recipe (NOT YET RUN)

Step 1 - Link Payment 17519 to Booking 17850:
  UPDATE payments SET booking_id = 17850 WHERE id = 17519;

Step 2 - Set confirmed = true and update amounts on Booking 17850:
  UPDATE bookings SET confirmed = true, amount_paid = 321.35, amount_open = 0 WHERE id = 17850;

Step 3 - Reconcile Payment 17519 in Xero (101 days overdue):
  EUR 321.35 Bank, May 7 2026. Check Hub fins/ for Xero match; link xeroPaymentId.

Risk: bookings / accounts; reversible; single student

Status: Open - Fix NOT RUN
Last checked: 2026-08-16 UTC (54th check)