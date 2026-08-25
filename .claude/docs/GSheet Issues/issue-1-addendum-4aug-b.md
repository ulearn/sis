Issue 1 - Orphan Payments + Stale Booking Courses (140th check Tue 4 Aug 2026 UTC)
Reporter: NM | Area: Cleanup | Sheet row: 2

Root Cause (fresh 2026-08-04 UTC)
Orphan payments (booking_id=null): 4 unchanged, 103 days.
- Payment 16988: EUR 339.90, payment_date=2026-04-28, xero=null -> matches booking 17856 (Galbusera)
- Payment 16989: EUR 339.90, payment_date=2026-04-28, xero=null -> matches booking 17857 (Fassina)
- Payment 17187: EUR 6151, transaction_id=D2026226, payment_date=2026-05-01, xero=null -> origin unknown
- Payment 4781: EUR 380, transaction_id=D20191404, payment_date=2019-08-20 -> legacy 2019, low-priority

Stale booking courses (active=true, end_date passed):
- BC 24630 (Fassina, General English AM Plus, ended 2026-07-10): 26 days stale
- BC 24631 (Galbusera, General English AM Plus, ended 2026-07-10): 26 days stale
- BC 25006 (Marina Larripa, General English AM Plus, ended 2026-08-03): 2 days stale
- Bookings 17856+17857: status=CONFIRMED, confirmed=false, amount_paid=EUR 339.90 each, 0 payments linked.

Fix Recipe (NOT YET RUN)
Step 1: UPDATE payments SET booking_id=17856 WHERE id=16988;
Step 2: UPDATE payments SET booking_id=17857 WHERE id=16989;
Step 3: UPDATE booking_courses SET active=false WHERE id IN (24630,24631,25006);
Step 4: UPDATE bookings SET confirmed=true WHERE id IN (17856,17857);
Step 5: Investigate payment 17187 (D2026226) in HubSpot+Xero to identify booking.

Risk: data-hygiene, money | Reversible: yes | 3 bookings, 2 students.

Status: NOT YET RUN | Last checked: 2026-08-04 UTC (140th check)