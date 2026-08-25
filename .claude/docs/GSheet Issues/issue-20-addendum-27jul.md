Issue 20 -- Ariunsarnai Batbayar (student 1047, booking 1605)
Reporter: PG | Area: Booking / Class | Sheet row 21

Symptom: Not appearing in to be assigned -- payment due.

Root cause (Mon 27 Jul 2026 -- 54th check):
- Booking 1605: status=PENDING, confirmed=false, Day 111 since Apr 6 2026
- Amount paid = EUR 0; amount total = EUR 1,509; 0 payment records
- Booking last updated Jun 23 2026 (34 days with no change)
- Booking course 1791 (Academic Year Renewal Morning, ends Oct 23 2026): active=true
- No hubspotContactId on student 1047

Fix recipe (NOT YET RUN):
Option A -- Chase payment:
  UPDATE booking SET status=CONFIRMED, confirmed=true, amountPaid=1509, updatedAt=NOW() WHERE id=1605;
  Then assign BC1791 to class.
Option B -- Cancel if student is gone:
  UPDATE booking SET status=CANCELLED, confirmed=false, updatedAt=NOW() WHERE id=1605;
  UPDATE booking_course SET active=false WHERE id=1791;

Risk: bookings/payments | Reversible yes | single student

Status: OPEN -- 54th check Mon 27 Jul 2026 UTC. Day 111. EUR 0 / EUR 1,509. Fix NOT RUN.
Last checked: 2026-07-27 UTC