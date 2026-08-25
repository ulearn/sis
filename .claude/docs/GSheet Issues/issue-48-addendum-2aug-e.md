Issue 48 — Galbusera + Fassina orphan payments (addendum 2 Aug 2026 — run E)
Reporter: AC | Area: Attendance/Classes | Sheet row: 50

Status: 30th check, 5th today — unchanged

Booking 17856 (Galbusera): CONFIRMED, confirmed=false, amountPaid=EUR 339.90, amountOpen=null, 0 payment records linked.
Booking 17857 (Fassina): CONFIRMED, confirmed=false, amountPaid=EUR 339.90, amountOpen=null, 0 payment records linked.
Payment 16988: EUR 339.90, Bank, bookingId=null, hubspotPaymentId=1204827374829, xeroPaymentId=null — 97 days orphaned.
Payment 16989: EUR 339.90, Bank, bookingId=null, hubspotPaymentId=1204846469317, xeroPaymentId=null — 97 days orphaned.
Booking course 24630 (bk 17857, Jun 29-Jul 10): active=true — 23 days stale.
Booking course 24631 (bk 17856, Jun 29-Jul 10): active=true — 23 days stale.
Cross-reference: Issue 1 orphan payments 16988+16989 are the likely match.

Fix recipe (NOT YET RUN):

1. Verify HubSpot payment IDs:
   Check which deal (Galbusera = bk17856, Fassina = bk17857) matches HS payments
   1204827374829 and 1204846469317 via HubSpot CRM deal pages.

2. Link payments to bookings (after verification):
   UPDATE payments SET booking_id = 17856 WHERE id = <pmt_for_galbusera>;
   UPDATE payments SET booking_id = 17857 WHERE id = <pmt_for_fassina>;

3. Set confirmed=true:
   UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

4. Fix amountOpen (currently null):
   SELECT amount_total, amount_paid FROM bookings WHERE id IN (17856, 17857);
   UPDATE bookings SET amount_open = amount_total - amount_paid WHERE id IN (17856, 17857);

5. Deactivate stale booking courses:
   UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Risk: payments/bookings | reversible | 2 students | HubSpot verification first
Status: NOT RUN | Last checked: 2026-08-02 UTC (30th check, 5th today)
