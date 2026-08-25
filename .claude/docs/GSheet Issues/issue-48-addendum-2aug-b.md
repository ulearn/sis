Issue 48 - Galbusera + Fassina - Unlinked payments; stale booking courses
Reporter: AC | Area: Attendance / Classes | Sheet row: 50

Symptom
Margherita Galbusera and Francesca Fassina do not appear in SIS class search.
amount_paid=EUR 339.90 on each booking but 0 payment records linked.

Root cause - 27th check Sun 2 Aug 2026 UTC (2nd today)
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false (anomaly), amount_paid=EUR 339.90, 0 payment records linked.
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false (anomaly), amount_paid=EUR 339.90, 0 payment records linked.
- Booking course 24631 (Galbusera, ended Jul 10 2026): active=true - 23 days stale.
- Booking course 24630 (Fassina, ended Jul 10 2026): active=true - 23 days stale.
- Orphan payment 16988: EUR 339.90, HubSpot payment ID 1204827374829, booking=null (97 days).
- Orphan payment 16989: EUR 339.90, HubSpot payment ID 1204846469317, booking=null (97 days).
- Amounts match exactly: EUR 339.90 each. Cross-reference with Issue 1 confirmed.
- These two orphan payments are almost certainly the Galbusera and Fassina payments.

Fix recipe - NOT YET RUN

Step 1: Verify in HubSpot
  Check HubSpot payment IDs 1204827374829 and 1204846469317.
  Confirm which payment belongs to Galbusera (booking 17856) and which to Fassina (booking 17857).
  Check the HubSpot contact linked to each payment for the name match.

Step 2: Link payments to bookings
  UPDATE payments SET booking_id=17856 WHERE id=16988;  -- or 16989 depending on step 1
  UPDATE payments SET booking_id=17857 WHERE id=16989;  -- vice versa

Step 3: Set confirmed=true on both bookings
  UPDATE bookings SET confirmed=true WHERE id IN (17856,17857);

Step 4: Deactivate stale booking courses
  UPDATE booking_courses SET active=false WHERE id IN (24630,24631);
  BC 24630 (Fassina, ended Jul 10): 23 days stale.
  BC 24631 (Galbusera, ended Jul 10): 23 days stale.

Step 5: Verify
  SELECT id,status,confirmed,amount_paid FROM bookings WHERE id IN (17856,17857);
  -- confirmed=true on both
  SELECT id,booking_id FROM payments WHERE id IN (16988,16989);
  -- booking_id set on both
  SELECT id,active FROM booking_courses WHERE id IN (24630,24631);
  -- active=false on both

Risk: money + data-hygiene | Reversible: Yes | Blast radius: 2 students, 2 payments

Status: Open - NOT YET RUN (97 days since payments created)
Last checked: Sun 2 Aug 2026 UTC (27th check, 2nd today)