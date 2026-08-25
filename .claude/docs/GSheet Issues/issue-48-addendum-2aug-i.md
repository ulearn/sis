Issue 48 -- Multiple students (BCs 24630+24631 stale 23d; payments unlinked)
Reporter: AC | Area: Attendance/Classes | Sheet row 50

Root Cause (34th check, 1st this hour -- Sun 2 Aug 2026 UTC)
- Booking 17856 (Galbusera): CONFIRMED, confirmed=false, amount_paid=EUR 339.90, 0 payment records.
  BC 24631 (General English AM Plus, Jun 29-Jul 10 2026): still active, 23 days stale.
- Booking 17857 (Fassina): CONFIRMED, confirmed=false, amount_paid=EUR 0, 0 payment records.
  BC 24630 (General English AM Plus, Jun 29-Jul 10 2026): still active, 23 days stale.
- Orphan payments 16988+16989 (EUR 339.90 each, HS IDs 1204827374829+1204846469317): still unlinked (see Issue 1).

Fix Recipe (NOT YET RUN)

Step 1 -- Deactivate stale BCs 24630 and 24631
UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id IN (24630, 24631);

Step 2 -- Link orphan payments to bookings
Verify in HubSpot: payment 1204827374829 = Galbusera (bk 17856), 1204846469317 = Fassina (bk 17857).
UPDATE payments SET booking_id=17856, updated_at=NOW() WHERE id=16988;
UPDATE payments SET booking_id=17857, updated_at=NOW() WHERE id=16989;
(Cross-ref Issue 1 -- orphan payments 16988 and 16989)

Step 3 -- Set confirmed=true once payments linked
UPDATE bookings SET confirmed=true, updated_at=NOW() WHERE id IN (17856, 17857);

Risk: Bookings + Payments. Reversible. 2 students. Cross-ref Issue 1 orphan payments.
Status: NOT RUN. Last checked: Sun 2 Aug 2026 UTC (34th check, 9th today)