Issue 13 - Lizbeth del Carmen - Health Insurance Fee Null - Addendum 23 Jul 2026

Sheet row: 14 | Check: 33rd (Thu 23 Jul 2026 UTC)

Status: UNCHANGED - 59 days unpriced

Evidence (fresh DB, 23 Jul 2026 UTC):
- Booking extra 96: details = PEL;Health, fee = null - 59 days since 25 May 2026
- Booking 17981 (Lizbeth del Carmen Sierra Martinez): Confirmed, EUR 1407.50 / 1407.50 fully paid
- Booking 17981 confirmed flag: false (last updated 23 Jun 2026)
- Student attending since 1 Jun 2026 - 52 school days with insurance unpriced

Fix Recipe (NOT YET RUN):

Step 1 - Confirm agreed fee with finance/agency, then:
  UPDATE "BookingExtra" SET fee = <agreed_fee> WHERE id = 96;

Step 2 - Set confirmed flag (payment already full):
  UPDATE "Booking" SET confirmed = true
  WHERE id = 17981 AND "amountPaid" >= "amountTotal";

Step 3 - Confirm what PEL;Health covers before setting fee.

Risk: Low. Fee needs human confirmation. Step 2 safe (payment full). Both reversible.

Last checked: Thu 23 Jul 2026 UTC