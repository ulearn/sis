Issue 1: Orphan Payments + Stale Booking Courses
Reporter: NM | Area: Cleanup | Sheet row: 2 | 198th check Sun 9 Aug 2026 UTC

SYMPTOM
Migration cleanup orphan payments manifest - payments with no booking_id.

ROOT CAUSE - 198th check UNCHANGED from 197th
Orphan payments (bookingId=null):
  Payment 4781:  EUR 380,     Flywire,          20 Aug 2019  (~2,551d orphaned) - legacy Fidelo
  Payment 16988: EUR 339.90,  Bank Transfer,    28 Apr 2026  (104d orphaned)
  Payment 16989: EUR 339.90,  Bank Transfer,    28 Apr 2026  (104d orphaned)
  Payment 17187: EUR 6,151,   TransferMate Escrow, 1 May 2026 (100d orphaned)
Linked anomalies:
  Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amountPaid=339.90, 0 payments linked
  Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false, amountPaid=339.90, 0 payments linked
  BCs 24630+24631 (General English AM Plus, ended 10 Jul 2026): active=true - 30d stale

FIX RECIPE - NOT YET RUN
Step 1 - Link payments to bookings:
UPDATE "Payment" SET "bookingId"=17856 WHERE id=16988;
UPDATE "Payment" SET "bookingId"=17857 WHERE id=16989;

Step 2 - Confirm bookings:
UPDATE "Booking" SET confirmed=true WHERE id IN (17856,17857);

Step 3 - Deactivate stale BCs:
UPDATE "BookingCourse" SET active=false WHERE id IN (24630,24631);

Step 4 - Payment 17187 (EUR 6,151 TransferMate Escrow): verify booking via Hub fins/ BEFORE touching. Large amount.
Step 5 - Payment 4781 (EUR 380 Fidelo 2019): confirm write-off approach with Neil.

RISK: money/bookings/data-hygiene. Steps 1-3 reversible; step 5 (write-off) not. Blast radius: 2 students + legacy.

STATUS: OPEN. 198th check Sun 9 Aug 2026 UTC. Unchanged.
Last checked: 2026-08-09 UTC