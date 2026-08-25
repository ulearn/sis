Issue 48 - Multiple Students: Class Assignment + Attendance (16th check 31 Jul 2026)
Fresh DB check 31 Jul 2026 UTC.

Margherita Galbusera (student 14461):
  BK17856: CONFIRMED, confirmed=false (anomaly), paid EUR 339.90, amountOpen=null
  BC24631 (General English AM Plus, Jun29-Jul10 2026): active=true -- 21d stale
  0 class assignments ever -- studied 2 weeks without any SCA

Francesca Fassina (student 14462):
  BK17857: CONFIRMED, confirmed=false (anomaly), paid EUR 339.90, amountOpen=null
  BC24630 (General English AM Plus, Jun29-Jul10 2026): active=true -- 21d stale
  0 class assignments ever -- studied 2 weeks without any SCA

Saikhantes (student 1001): returns Mon 24 Aug -- tracked in Issue 15.

Fix recipe - NOT YET RUN:
1. Check payments for BK17856 and BK17857 to confirm legitimate:
   SELECT p.id, p.amount, p.method, p.xero_payment_id, p.booking_id FROM payments p WHERE p.booking_id IN (17856, 17857);
2. Deactivate stale BCs:
   UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);
3. If payments confirmed: UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);
4. Retrospective SCAs: ask Paul which class Galbusera+Fassina attended Jun29-Jul10 if attendance certificates needed.
   If not needed, the data gap (0 SCAs) can remain.
5. Saikhantes SCA: see Issue 15 recipe.
Risk: data-hygiene / bookings. Reversible. Blast radius: 2 completed students + 1 returning.
Last checked: 2026-07-31 UTC (16th check).