Issue 20 - Ariunsarnai Batbayar Payment Due - 16th check Mon 3 Aug 2026 UTC (2nd today)

Root Cause (confirmed 2026-08-03, 16th check):
- Booking 1605 (student 1047): status=PENDING, confirmed=false.
- amount_paid=EUR 0, amount_open=EUR 1509. No payment received.
- BC1791 (AY Renewal Morning, Apr13-Oct23): active=true, 0 class assignments.
- Day ~113 since course start Apr 13 2026.

Fix Recipe - NOT YET RUN
Option A (payment confirmed): UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1605;
  Then create SCA via SIS admin for BC1791.
Option B (no payment): UPDATE bookings SET status=CANCELLED WHERE id=1605;
  UPDATE booking_courses SET active=false WHERE id=1791;
Check HubSpot deal for payment status. Neil to decide.

Risk: Bookings, money, attendance. Single student. Reversible.
Status: UNCHANGED. EUR 0/1509, PENDING, 0 SCAs, day ~113. Fix NOT RUN.
Last checked: 2026-08-03 UTC (16th hourly check, 2nd today)