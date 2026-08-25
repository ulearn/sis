# Issue 48 -- Galbusera + Fassina payments (addendum 2 Aug c)

Reporter: Paul/AC  Area: Attendance/Classes  Sheet row: 50

## Symptom
Multiple students (Uyanga Tungalag, Ana Jessica Rosa de Paula Santos, Telmuun Enkhsaikhan, etc.)
cross-issue check. Two sub-issues for Galbusera + Fassina: payments not linked, confirmed=false.

## Root cause (28th check Sun 2 Aug 2026 UTC)

- BK 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amtPaid=339.90, amtOpen=null.
  BC 24631 (General English AM Plus, BK 17856): ended 2026-07-10, active=true, 0 SCAs -- 23d stale.
  0 payment records linked despite amtPaid=339.90.

- BK 17857 (Francesca Fassina): CONFIRMED, confirmed=false, amtPaid=339.90, amtOpen=null.
  BC 24630 (General English AM Plus, BK 17857): ended 2026-07-10, active=true, 0 SCAs -- 23d stale.
  0 payment records linked despite amtPaid=339.90.

- Orphan PMT 16988: EUR 339.90, Bank Transfer, hubspotPaymentId=1204827374829, bookingId=null.
  Amount matches BK 17856 exactly. HubSpot payment ID points to Galbusera deal.

- Orphan PMT 16989: EUR 339.90, Bank Transfer, hubspotPaymentId=1204846469317, bookingId=null.
  Amount matches BK 17857 exactly. HubSpot payment ID points to Fassina deal.

## Fix recipe (NOT YET RUN)

Step 0 -- Verify HubSpot IDs (do this first):
  In HubSpot: look up payment IDs 1204827374829 (Galbusera) and 1204846469317 (Fassina)
  Confirm student names and amounts match.

Step 1 -- Link PMT 16988 to BK 17856 (Galbusera):
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;

Step 2 -- Link PMT 16989 to BK 17857 (Fassina):
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;

Step 3 -- Set confirmed=true on both bookings:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 4 -- Fix amtOpen (should be 0 after payment link):
  UPDATE bookings SET amount_open = 0 WHERE id IN (17856, 17857);

Step 5 -- Deactivate stale BCs:
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 6 -- Verify:
  SELECT b.id, b.confirmed, b.amount_paid, b.amount_open, COUNT(p.id) as pmt_count
  FROM bookings b LEFT JOIN payments p ON p.booking_id = b.id
  WHERE b.id IN (17856, 17857) GROUP BY b.id, b.confirmed, b.amount_paid, b.amount_open;

## Risk
Category: money (payment linking). Reversible: yes.
Blast radius: 2 bookings, 2 payments, 2 booking courses.

## Status
OPEN. Fix NOT RUN. Last checked: Sun 2 Aug 2026 UTC (28th check)