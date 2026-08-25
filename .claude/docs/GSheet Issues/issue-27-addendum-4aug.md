Issue 27 addendum 4 Aug 2026

Booking 17909 (Sofiia Korkishchenko, student 768): CANCELLED but confirmed=true (anomaly). Last updated 17 Jun 2026 (48 days). Amount paid=EUR 0, amount open=EUR 727.50. BC 24693 (Renewal AY PM, 25 May to 13 Nov 2026): active=true on cancelled booking. Same anomaly as Issue 7 (row 8).

FIX NOT RUN:
UPDATE booking SET confirmed=false WHERE id=17909;
UPDATE booking_course SET active=false WHERE id=24693;

Last checked: 2026-08-04 UTC