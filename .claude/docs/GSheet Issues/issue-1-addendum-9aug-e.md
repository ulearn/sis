# Issue 1 -- Orphan Payments + Unlinked Bookings
Check: 202nd, Sun 9 Aug 2026 UTC | Reporter: NM | Row: 2

ROOT CAUSE -- CURRENT STATE (NO CHANGE)

Orphan Payments (bookingId = null):
  Pmt  4781  EUR   380.00  Flywire    2019-08-20  ~2,547 days orphaned
  Pmt 16988  EUR   339.90  HubSpot    2026-04-28    ~103 days orphaned
  Pmt 16989  EUR   339.90  HubSpot    2026-04-28    ~103 days orphaned
  Pmt 17187  EUR 6,151.00  TM Escrow  2026-05-01    ~100 days orphaned

Unlinked Bookings (confirmed = false, no payments linked):
  Bk 17856  Margherita Galbusera  CONFIRMED  confirmed = false  amountPaid = 339.90  amountOpen = null
  Bk 17857  Francesca Fassina     CONFIRMED  confirmed = false  amountPaid = 339.90  amountOpen = null
  Payments 16988 + 16989 are the natural match for bookings 17856 + 17857.

FIX RECIPE -- NOT YET RUN

  -- Link payments to bookings
  UPDATE payments SET booking_id = 17856, updated_at = NOW() WHERE id = 16988;
  UPDATE payments SET booking_id = 17857, updated_at = NOW() WHERE id = 16989;

  -- Confirm both bookings
  UPDATE bookings SET confirmed = true, amount_open = 0, updated_at = NOW() WHERE id IN (17856, 17857);

  -- Deactivate stale booking courses (ended 2026-07-10, still active = true)
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id IN (24630, 24631);

  Remaining orphans (4781 + 17187): investigate separately.
  Pmt 17187 (EUR 6,151 TransferMate Escrow): check Hub fins/ for matching TransferMate tx.
  Pmt 4781 (EUR 380, 2019): ancient Fidelo entry -- confirm with Neil before linking or writing off.

RISK: Category = Payments / bookings / data hygiene | Reversible = Yes
Blast radius: 2 students, 2 booking courses; 2 further orphans deferred
Urgency: Medium -- ~103 days since payments 16988/16989 arrived

STATUS: Open -- Fix NOT RUN
Last checked: Sun 9 Aug 2026 UTC (202nd check)
