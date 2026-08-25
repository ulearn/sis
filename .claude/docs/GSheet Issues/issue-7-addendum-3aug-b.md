Issue 7 Sofiia Korkishchenko Booking Anomaly - 22nd check Mon 3 Aug 2026 UTC 2nd today

Root Cause: UNCHANGED 48 days.
Booking 17909 student 768: status=CANCELLED confirmed=true -- anomaly
BC24693 Renewal AY PM May25-Nov13: active=true -- booking is CANCELLED
amount_open=EUR 727.50 amount_paid=EUR 0 0 payments ever linked

Fix Recipe - NOT YET RUN
UPDATE bookings SET confirmed=false WHERE id=17909 AND status=CANCELLED;
UPDATE booking_courses SET active=false WHERE id=24693;

Risk: Data hygiene. Single student. Reversible. 48 days unchanged.
Last checked: 2026-08-03 UTC (22nd hourly check, 2nd today)