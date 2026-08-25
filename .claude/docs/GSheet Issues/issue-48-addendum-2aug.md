# Issue 48 - Galbusera / Fassina: Orphan Payments + Stale Booking Courses
Reporter: AC | Area: Attendance / Classes | Sheet row: 50

## Root cause — 26th check Sun 2 Aug 2026 UTC (1st today)
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false (anomaly), amountPaid=EUR 339.90, 0 payment records linked.
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false (anomaly), amountPaid=EUR 339.90, 0 payment records linked.
- Booking course 24631 (Galbusera, ended Jul 10 2026): active=true — 23 days stale.
- Booking course 24630 (Fassina, ended Jul 10 2026): active=true — 23 days stale.
- Orphan payment 16988 (Issue 1): EUR 339.90, HubSpot ID 1204827374829, booking_id=null — exact match to bk 17856.
- Orphan payment 16989 (Issue 1): EUR 339.90, HubSpot ID 1204846469317, booking_id=null — exact match to bk 17857.
- Students attended ILEP for 2 weeks ending Jul 10. Reporter AC returns Aug 24.

## Fix recipe — NOT YET RUN

Step 1: Verify HubSpot payment IDs against students
  Check HubSpot deals for Galbusera + Fassina; confirm 1204827374829 and 1204846469317 belong to these students.

Step 2: Link orphan payments to bookings
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;
  (Swap if HubSpot shows reverse assignment.)

Step 3: Set confirmed=true on both bookings
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 4: Deactivate stale booking courses
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 5: Verify
  SELECT id, confirmed, amount_paid FROM bookings WHERE id IN (17856, 17857); -- confirmed=true each
  SELECT active FROM booking_courses WHERE id IN (24630, 24631); -- both false
  SELECT booking_id FROM payments WHERE id IN (16988, 16989); -- 17856 and 17857

## Risk / category
Category: payments + bookings + data-hygiene | Reversible: Yes
Blast radius: 2 students, 2 payments (EUR 339.90 each), 2 stale booking courses
Note: HubSpot verification required before linking payments.

## Status
Open — NOT YET RUN. AC returns Aug 24.
Last checked: Sun 2 Aug 2026 UTC (26th check, 1st today)