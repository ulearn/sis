Issue 1 -- 190th check, Sat 8 Aug 2026 UTC
Sheet row: 2 | Area: Cleanup | Various students
===
UNCHANGED from 189th check.

Orphan payments (booking_id = null):
  Payment 4781:  EUR 380.00  Flywire          2019-08-20  ~2548 days (legacy Fidelo)
  Payment 16988: EUR 339.90  Bank             2026-04-28   104 days
  Payment 16989: EUR 339.90  Bank             2026-04-28   104 days
  Payment 17187: EUR 6151.00 TransferMate     2026-05-01   100 days

Unlinked bookings:
  Booking 17856 Margherita Galbusera: CONFIRMED confirmed=false amtPaid=339.90 0 linked pmts
  Booking 17857 Francesca Fassina:    CONFIRMED confirmed=false amtPaid=339.90 0 linked pmts

Stale BCs:
  BC 24630: active=true ended 2026-07-10 (29 days)
  BC 24631: active=true ended 2026-07-10 (29 days)

FIX RECIPE - NOT YET RUN
  1. UPDATE payments SET booking_id=17856 WHERE id=16988;
  2. UPDATE payments SET booking_id=17857 WHERE id=16989;
  3. UPDATE bookings SET confirmed=true WHERE id IN (17856,17857);
  4. UPDATE booking_courses SET active=false WHERE id IN (24630,24631);
  5. Payment 17187 EUR 6151: verify HubSpot/Xero booking match before linking.
  6. Payment 4781 EUR 380 2019: legacy -- verify Fidelo records; likely write-off.

RISK: money + data-hygiene. Steps 1-4 reversible. Step 5 needs HubSpot check first.
Last checked: Sat 8 Aug 2026 UTC (190th check)
