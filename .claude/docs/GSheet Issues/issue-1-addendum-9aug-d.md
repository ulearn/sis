Issue 1 -- Orphan Payments + Unlinked Bookings
Check: 200th, Sun 9 Aug 2026 UTC | Reporter: NM | Row: 2

ROOT CAUSE -- CURRENT STATE

Orphan Payments (bookingId=null, all xeroPaymentId=null):
  Pmt  4781  EUR   380.00  Fidelo      2019-08-20  ~2553 days orphaned
  Pmt 16988  EUR   339.90  HubSpot     2026-04-28    106 days orphaned
  Pmt 16989  EUR   339.90  HubSpot     2026-04-28    106 days orphaned
  Pmt 17187  EUR 6,151.00  Fidelo Esc  2026-05-01    102 days orphaned

Unlinked Bookings (no payments linked, amountPaid prefilled):
  Bk 17856  Margherita Galbusera  CONFIRMED  confirmed=false  paid=339.90  pmts=0  open=null
  Bk 17857  Francesca Fassina     CONFIRMED  confirmed=false  paid=339.90  pmts=0  open=null
  Pmts 16988+16989 are the natural match for bk 17856+17857.

Stale Booking Courses (active=true, 30d stale):
  BC 24630  General English AM Plus  ended 2026-07-10
  BC 24631  General English AM Plus  ended 2026-07-10

FIX RECIPE -- NOT YET RUN

  UPDATE Payment SET bookingId=17856, updatedAt=NOW() WHERE id=16988;
  UPDATE Payment SET bookingId=17857, updatedAt=NOW() WHERE id=16989;
  UPDATE Booking SET confirmed=true, amountOpen=0, updatedAt=NOW() WHERE id IN (17856,17857);
  UPDATE BookingCourse SET active=false, updatedAt=NOW() WHERE id IN (24630,24631);

  Remaining orphans (4781+17187): investigate separately.
  Pmt 17187 (EUR 6151 Escrow): check Hub fins/ for matching TransferMate tx.
  Pmt 4781 (EUR 380, 2019): ancient Fidelo entry -- confirm with Neil before linking/writing off.

RISK: Category=Payments/Bookings/Data hygiene | Reversible=Yes
Blast radius: 2 students, 2 BCs, 2 minor orphans deferred
Urgency: Medium -- 106 days since pmts 16988/16989 arrived

STATUS: Open -- Fix NOT RUN | Last checked: Sun 9 Aug 2026 UTC (200th check)
