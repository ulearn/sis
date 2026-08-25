# Issue 1 - Orphan Payments + Stale BCs (139th check Tue 4 Aug 2026 UTC)
Reporter: NM | Area: Cleanup | Sheet row: 2

## Root Cause (fresh - 2026-08-04 UTC)

Orphan payments (4 - unchanged 103+ days):
- Payment 4781: EUR 380.00, transaction_id=D20191404, legacy 2019, xero=null
- Payment 16988: EUR 339.90, booking_id=null, xero=null -- matches booking 17856 (Galbusera)
- Payment 16989: EUR 339.90, booking_id=null, xero=null -- matches booking 17857 (Fassina)
- Payment 17187: EUR 6,151.00, transaction_id=D2026226, booking_id=null, 103 days, unknown origin

Stale BCs (3):
- BC 24630 (Francesca Fassina, GE AM Plus, ended Jul 10): active=true, 25 days stale
- BC 24631 (Margherita Galbusera, GE AM Plus, ended Jul 10): active=true, 25 days stale
- BC 25006 (Marina Larripa, ended Aug 3): active=true, 1 day stale (also Issue 38)

Bookings 17856+17857: CONFIRMED, confirmed=false, amount_paid=EUR 339.90 each, 0 payments linked.

## Fix Recipe (NOT YET RUN)

Step 1 - Link payments:
  UPDATE payments SET booking_id = 17856, updated_at = NOW() WHERE id = 16988;
  UPDATE payments SET booking_id = 17857, updated_at = NOW() WHERE id = 16989;

Step 2 - Fix confirmed flag:
  UPDATE bookings SET confirmed = true, updated_at = NOW() WHERE id IN (17856, 17857);

Step 3 - Deactivate stale BCs:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id IN (24630, 24631);
  -- BC 25006 handled by Issue 38; add id=25006 if that has not run yet

Step 4 - Investigate payment 17187 (EUR 6,151):
  Search Xero/TransferMate for reference D2026226; link or flag for manual reconciliation.

Step 5 - Legacy payment 4781 (EUR 380, 2019):
  Verify in Xero; if reconciled, archive/flag as legacy-void.

Step 6 - Verify:
  SELECT id, amount, booking_id FROM payments WHERE booking_id IS NULL;
  SELECT id, confirmed FROM bookings WHERE id IN (17856, 17857);
  SELECT id, active FROM booking_courses WHERE id IN (24630, 24631, 25006);

## Risk
Category: money, data-hygiene | Reversible: yes
Payment 17187 (EUR 6,151): needs investigation before linking.

## Status: NOT RUN. Last checked: 2026-08-04 UTC