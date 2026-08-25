ISSUE 1 — Orphan payments (4 unlinked, 95d+)
==============================================

Area: Cleanup  Row: 2  Checked: 2026-08-01 UTC (121st hrly, 1st of day)

SYMPTOM
-------
4 payments with booking_id = null. Cannot be attributed to a student or booking.

ROOT CAUSE / DB STATE (confirmed 2026-08-01 UTC)
------------------------------------------------
- Payment 16988: EUR 339.90, Bank Transfer, booking_id = null, HubSpot payment ID 1204827374829.
  Created: 2026-04-28. Age: 95 days. UNCHANGED.
- Payment 16989: EUR 339.90, Bank Transfer, booking_id = null, HubSpot payment ID 1204846469317.
  Created: 2026-04-28. Age: 95 days. UNCHANGED.
- Payment 17187: EUR 6,151.00, TransferMate Escrow, booking_id = null, fidelo_payment_id = 37587.
  Created: 2026-05-05. Age: 88 days. UNCHANGED.
- Payment 4781: EUR 380.00, Flywire, booking_id = null, fidelo_payment_id = 32056.
  Created (migration): 2026-04-10. Legacy ~7yr old payment from 2019. UNCHANGED.

FIX RECIPE (NOT YET RUN)
------------------------

Step 1 — Identify bookings for payments 16988 + 16989 via HubSpot (NOT YET RUN):
  - HubSpot payment IDs: 1204827374829 and 1204846469317
  - Look up associated deal/contact in HubSpot → find corresponding booking in SIS
  - Update: UPDATE payments SET booking_id = <BOOKING_ID> WHERE id IN (16988, 16989);

Step 2 — Investigate payment 17187 via fidelo deal D2026226 (NOT YET RUN):
  - fidelo_payment_id = 37587, TransferMate Escrow EUR 6,151
  - Check Fidelo or deal records for deal reference D2026226 → identify student/booking
  - Update: UPDATE payments SET booking_id = <BOOKING_ID> WHERE id = 17187;

Step 3 — Review payment 4781 (NOT YET RUN):
  - Flywire, EUR 380, fidelo_payment_id = 32056. Legacy 2019 payment.
  - Confirm if this can be linked or should be written off as pre-SIS record.

Step 4 — Verify:
  SELECT id, amount, method, booking_id FROM payments WHERE id IN (4781, 16988, 16989, 17187);
  -- Expected: all booking_id non-null (or 4781 confirmed as legacy/write-off)

RISK
----
Category: money/data-hygiene. Reversible: yes. Blast radius: 4 payments, max EUR 7,210.70.
Payment 17187 (EUR 6,151) is the highest priority — large TransferMate Escrow amount.

STATUS: OPEN — 95d/95d/88d/legacy. Fix NOT RUN.
Last checked: 2026-08-01 UTC (1st check of day)
