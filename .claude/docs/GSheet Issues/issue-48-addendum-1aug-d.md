Issue 48 - Galbusera / Fassina: Orphan Payments + Stale Booking Courses

Reporter: AC | Area: Attendance/classes | Sheet row: 50 | Check: 25th (9th Sat 1 Aug 2026 UTC)

Root Cause (fresh DB - NOT YET FIXED):
Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false (anomaly), amountPaid=EUR 339.90, 0 payment records linked.
Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false (anomaly), amountPaid=EUR 339.90, 0 payment records linked.
Booking course 24631 (Galbusera, ended Jul 10 2026): active=true - 22 days stale.
Booking course 24630 (Fassina, ended Jul 10 2026): active=true - 22 days stale.
Orphan payment 16988: EUR 339.90, HubSpot ID 1204827374829, booking_id=null - matches Galbusera amount.
Orphan payment 16989: EUR 339.90, HubSpot ID 1204846469317, booking_id=null - matches Fassina amount.
Cross-reference with Issue 1 confirmed: these 2 orphan payments almost certainly match bookings 17856+17857.

Fix Recipe (NOT YET RUN):
Step 1 - Verify HubSpot payment IDs: check HubSpot deals for bookings 17856+17857; confirm payments 1204827374829 + 1204846469317 belong to these students.
Step 2 - Link orphan payment 16988 to booking 17856 (NOT YET RUN): UPDATE payments SET booking_id=17856 WHERE id=16988;
Step 3 - Link orphan payment 16989 to booking 17857 (NOT YET RUN): UPDATE payments SET booking_id=17857 WHERE id=16989;
Step 4 - Set confirmed=true on both bookings (NOT YET RUN): UPDATE bookings SET confirmed=true WHERE id IN (17856, 17857);
Step 5 - Deactivate stale booking courses (NOT YET RUN): UPDATE booking_courses SET active=false WHERE id IN (24630, 24631);
Step 6 - Verify: SELECT id, confirmed, amount_paid FROM bookings WHERE id IN (17856, 17857);

Risk: payments/bookings, reversible, 2 students. HubSpot verification required before linking.

Status: Open - 25th check (9th today). NOT FIXED. AC returns Aug 24.
Last checked: 2026-08-01 UTC
