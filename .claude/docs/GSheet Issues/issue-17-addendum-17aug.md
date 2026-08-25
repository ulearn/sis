Issue 17 -- Ana Jessica Rosa de Paula Santos (student 766, booking 1308)
Reporter: | Area: Booking | Row 18 | 36th check Mon 17 Aug 2026 UTC

Booking 1308: status=CANCELLED, confirmed=false, last updated 2026-06-07 (71 days ago)
Amount paid: EUR 1,530 (Payment 17186 EUR 1,280 + Payment 17050 EUR 250)
Both payments: xeroPaymentId=null -- not reconciled in Xero
Booking Course 1350 (Academic Year Afternoon): ends 2026-11-13, active=true -- orphaned on cancelled booking
Only one booking for student 766 -- no successor booking

Core question: was this an accidental cancellation, or genuine with refund owed?

FIX RECIPE A -- If accidental cancellation (student still active):
  UPDATE bookings SET status='CONFIRMED', confirmed=true WHERE id=1308;
  -- Then reconcile Payments 17186 + 17050 in Xero

FIX RECIPE B -- If genuine cancellation (student left):
  UPDATE booking_courses SET active=false WHERE id=1350;
  -- Process refund EUR 1,530 via Xero
  -- Reconcile Payments 17186 + 17050 in Xero

Risk: Bookings/Money | Blast radius: 1 student, EUR 1,530
Info needed: Was booking 1308 intentionally cancelled? Is Ana Jessica still enrolled?
Status: Fix NOT RUN. EUR 1,530 unreconciled in Xero (71 days). BC 1350 active on cancelled booking.
Last checked: 2026-08-17 UTC (36th check)
