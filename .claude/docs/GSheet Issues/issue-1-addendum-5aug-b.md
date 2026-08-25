Issue 1 - Orphan Payments + Stale Booking Courses
Reporter: NM | Area: Cleanup | Sheet row 2

Symptom: Orphan payment records (booking_id = null) from migration; stale BCs still active.

Root cause (148th hourly check - Wed 5 Aug 2026 UTC)

Orphan payments (4 unchanged - 107 days):
  Payment 16988: EUR 339.90, transactionId=null, xeroId=null, bookingId=null
  Payment 16989: EUR 339.90, transactionId=null, xeroId=null, bookingId=null
  Payment 17187: EUR 6,151, transactionId=D2026226, xeroId=null, bookingId=null
  Payment 4781:  EUR 380, transactionId=D20191404, xeroId=null, bookingId=null

Stale booking courses:
  BC 24630 (Francesca Fassina):    ends 2026-07-10, active=true, SCAs=0, 26 days stale
  BC 24631 (Margherita Galbusera): ends 2026-07-10, active=true, SCAs=0, 26 days stale
  BC 25006 (Marina Larripa):       ends 2026-08-03, active=true, SCAs=2, 2 days stale

Booking anomalies (confirmed=false despite CONFIRMED status):
  Booking 17856: status=CONFIRMED, confirmed=false, paid=339.90, open=null
  Booking 17857: status=CONFIRMED, confirmed=false, paid=339.90, open=null
Note: amountPaid=339.90 on bookings but payment FK (bookingId) still null on pmts 16988/16989.

Fix recipe (NOT YET RUN)

Step 1 - Link orphan payments to bookings:
  UPDATE payment SET booking_id = 17856 WHERE id = 16988;   -- verify 17856=Galbusera first
  UPDATE payment SET booking_id = 17857 WHERE id = 16989;   -- verify 17857=Fassina first

Step 2 - Fix confirmed flag:
  UPDATE booking SET confirmed = true WHERE id IN (17856, 17857) AND status = 'CONFIRMED';

Step 3 - Deactivate stale BCs:
  UPDATE booking_course SET active = false WHERE id IN (24630, 24631, 25006);

Step 4 - Payment 17187 (EUR 6,151 - large): trace via ssh hub@localhost fins/ for D2026226.
Step 5 - Payment 4781 (EUR 380, 2019 legacy): confirm with Neil - archive or link.

Risk: money | data-hygiene | Reversible: yes | Blast radius: medium
Status: Open - 4 orphan payments unchanged 107+ days. NOT RUN.
Last checked: Wed 5 Aug 2026 UTC (148th hourly check)