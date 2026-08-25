Issue 1 — Orphan Payments (Addendum, 8 Aug 2026 — b)
Reporter: NM | Area: Cleanup | Sheet row: 2 | 186th check Sat 8 Aug 2026 UTC

Root Cause (live data, 8 Aug 2026 UTC — unchanged — NOT YET RUN)

Orphan Payments (all booking_id=null, xeroPaymentId=null):
  Payment 4781: EUR 380, Flywire, 2019-08-20 (legacy Fidelo, ~2545 days)
  Payment 16988: EUR 339.90, Bank, 2026-04-28 (102 days)
  Payment 16989: EUR 339.90, Bank, 2026-04-28 (102 days)
  Payment 17187: EUR 6151, TransferMate Escrow, 2026-05-01 (99 days)

Unlinked bookings:
  Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amountPaid=EUR 339.90 (field set, no payment FK)
    BC 24631 (General English AM Plus, ended 10 Jul 2026): active, 29 days stale
  Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false, amountPaid=EUR 339.90 (field set, no payment FK)
    BC 24630 (General English AM Plus, ended 10 Jul 2026): active, 29 days stale

Fix Recipe (NOT YET RUN)

Step 1 — Link payments to bookings:
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;

Step 2 — Set confirmed=true:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 3 — Deactivate stale BCs 24630+24631:
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 4 — Identify payment 17187 (EUR 6151 TransferMate Escrow):
  Check TransferMate / HubSpot deals early May 2026 for EUR 6151.
  Then: UPDATE payments SET booking_id = <ID> WHERE id = 17187;

Step 5 — Payment 4781 (EUR 380, 2019 Flywire): Legacy. Neil to decide.

Risk: money/data-hygiene; reversible; Steps 1-3 safe, Steps 4-5 need Neil verification
Status: OPEN — Fix NOT RUN (186th check, unchanged)
Last checked: 2026-08-08 UTC
