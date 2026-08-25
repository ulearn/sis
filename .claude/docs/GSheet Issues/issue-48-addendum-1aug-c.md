# Issue 48 - Galbusera, Fassina - confirmed=false + Orphan Payment Link Discovered

Reporter: AC | Area: Attendance/Classes | Sheet row: 50 | Check: 23rd (7th Sat 1 Aug 2026 UTC)

## Symptom
Students missing from SIS class assignment. Galbusera and Fassina bookings confirmed=false despite CONFIRMED status and payment received.

## Current State (fresh DB -- NOT YET FIXED)

Booking 17856 (Margherita Galbusera, student 14461): CONFIRMED, confirmed=false, amount_paid=EUR 339.90, amount_open=null.
Booking 17857 (Francesca Fassina, student 14462): CONFIRMED, confirmed=false, amount_paid=EUR 339.90, amount_open=null.
BC 24631 (Galbusera, GE AM Plus, Jun 29-Jul 10 2026): active=true -- 22 days stale.
BC 24630 (Fassina, GE AM Plus, Jun 29-Jul 10 2026): active=true -- 22 days stale.

NEW FINDING - Payment linkage gap (discovered Sat Aug 1):
Query returns 0 payment records linked to booking_id 17856 or 17857.
Yet both bookings show amount_paid=EUR 339.90.

Cross-reference with Issue 1 orphan payments:
  Payment 16988: EUR 339.90, Bank, hubspot_payment_id=1204827374829, booking_id=null
  Payment 16989: EUR 339.90, Bank, hubspot_payment_id=1204846469317, booking_id=null
Amounts match exactly. These are almost certainly the missing payments for bookings 17856+17857.
Fixing Issue 48 would simultaneously resolve Issue 1 orphan payments 16988+16989.

## Fix Recipe (NOT YET RUN)

Step 1 - Verify via HubSpot:
  Look up HubSpot payment IDs 1204827374829 and 1204846469317.
  Confirm which belongs to Galbusera and which to Fassina.

Step 2 - Link orphan payments to bookings:
  UPDATE payments SET booking_id = 17856 WHERE id = 16988; -- adjust per HubSpot verification
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;

Step 3 - Set confirmed = true on both bookings:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 4 - Deactivate stale BCs:
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 5 - Verify:
  SELECT id, status, confirmed, amount_paid FROM bookings WHERE id IN (17856, 17857);
  SELECT id, booking_id, amount FROM payments WHERE id IN (16988, 16989);
  SELECT id, active FROM booking_courses WHERE id IN (24630, 24631);

## Risk
Category: money, bookings, data-hygiene. Reversible: yes. Blast radius: 2 students + 2 orphan payments (Issue 1).
Info needed: confirm with AC that courses are complete (ended Jul 10).
Connection: resolving this also fixes Issue 1 orphan payments 16988+16989.

## Status
Open -- 23rd check, NOT FIXED. Payment linkage gap newly discovered. AC returns Aug 24.
Last checked: 2026-08-01 UTC (7th check today)