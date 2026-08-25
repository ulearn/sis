Issue 48 Addendum - Fri 31 Jul 2026 (15th check)
Reporter: AC | Area: Attendance/Classes | Sheet row: 50
Students: Galbusera, Fassina, Saikhantes

STATUS: UNCHANGED - GALBUSERA + FASSINA ZERO SCAs; BCs 21 DAYS STALE

Evidence (live DB, 15th check Fri 31 Jul 2026 UTC)

Margherita Galbusera (student 14461, booking 17856):
  Booking 17856: CONFIRMED, confirmed = false (anomaly)
  BC 24631 (General English AM Plus, 29 Jun - 10 Jul 2026): active = true (stale 21 days)
  Class assignments: 0 (zero ever)

Francesca Fassina (student 14462, booking 17857):
  Booking 17857: CONFIRMED, confirmed = false (anomaly)
  BC 24630 (General English AM Plus, 29 Jun - 10 Jul 2026): active = true (stale 21 days)
  Class assignments: 0 (zero ever)

Saikhantes Shagdarsuren: new SCA needed from 24 Aug 2026 (no change this check).

Fix Recipe (NOT YET RUN)

Step 1 - Set confirmed = true:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857) AND status = 'CONFIRMED';
  Expected: 2 rows updated

Step 2 - Deactivate stale BCs:
  UPDATE booking_courses SET active = false WHERE id IN (24631, 24630) AND end_date < CURRENT_DATE;
  Expected: 2 rows updated

Step 3 - Saikhantes SCA from 24 Aug: see issue-15-saikhantes-class.md.

Step 4 - Verify:
  SELECT id, status, confirmed FROM bookings WHERE id IN (17856, 17857);
  SELECT id, active, end_date FROM booking_courses WHERE id IN (24630, 24631);

Risk: bookings, data-hygiene | Reversible: Yes | Blast radius: 2 booking updates, 2 BC deactivations

Status: Fix NOT RUN. 15th check Fri 31 Jul 2026 UTC.
