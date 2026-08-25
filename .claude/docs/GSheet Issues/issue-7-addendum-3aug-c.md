Issue 7 - Sofiia Korkishchenko Booking Anomaly - 23rd check Mon 3 Aug 2026 UTC (3rd today)

Root Cause (confirmed 2026-08-03, 23rd check):
- Booking 17909 (student 768): status=CANCELLED, confirmed=true. Anomalous (49 days unchanged).
- Booking course 24693 (AY Renewal PM, May25-Nov13): active=true on CANCELLED booking.
- amount_open=EUR 727.50, amount_paid=EUR 0.

Fix Recipe - NOT YET RUN
Step 1: UPDATE bookings SET confirmed=false WHERE id=17909;
Step 2: UPDATE booking_courses SET active=false WHERE id=24693;
Step 3: Verify via SIS admin.

Risk: Bookings and data hygiene. Single student. Reversible.
Status: UNCHANGED. 49 days. Fix NOT RUN.
Last checked: 2026-08-03 UTC (23rd hourly check, 3rd today)