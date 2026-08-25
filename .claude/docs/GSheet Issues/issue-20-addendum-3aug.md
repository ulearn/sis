Issue 20 Ariunsarnai Batbayar Payment Due - 15th check Mon 3 Aug 2026 UTC 1st today

Root Cause: UNCHANGED. Day 114 since course start Apr 13 2026.
Booking 1605 student 1047: status=PENDING confirmed=false
amount_paid=EUR 0 amount_open=EUR 1509 no payment ever received
BC1791 AY Renewal Morning Apr13-Oct23: active=true 0 SCAs
0 payments in database for bk1605

Fix Recipe - NOT YET RUN
Option A payment confirmed: create payment record set bk1605 confirmed=true/CONFIRMED create SCA on BC1791
Option B cancel: UPDATE bookings SET status=CANCELLED confirmed=false WHERE id=1605;
                 UPDATE booking_courses SET active=false WHERE id=1791;

Risk: Money+Bookings. Financial decision needed from Neil/accounts. Day 114.
Last checked: 2026-08-03 UTC (15th hourly check, 1st today)