Issue 1 -- Orphan Payments -- Addendum 24 Jul (g)

Reporter: NM | Area: Cleanup | Sheet row: 2
Checked: Fri 24 Jul 2026 UTC -- 62nd hourly check, 159th total run

CURRENT STATUS -- 4 ORPHAN PAYMENTS, UNCHANGED
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026, bookingId = null, xeroId = null -- 87 days orphaned
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026, bookingId = null, xeroId = null -- 87 days orphaned
- Payment 17187: EUR 6,151.00, TransferMate Escrow, 1 May 2026 (DB date; prior reports said 5 May)
  bookingId = null, xeroId = null, fideloPaymentId = 37587, transactionId = D2026226 -- 84 days
- Payment 4781: EUR 380.00, Flywire, 20 Aug 2019, fideloPaymentId = 32056 -- permanently unresolvable
- Stale booking courses: 24,436 -- unchanged
- Stale booking accommodations with active beds: 43 -- unchanged

FIX RECIPE (NOT YET RUN)

Payments 16988 + 16989:
  Check HubSpot for deal with EUR 339.90 receipt around 28 Apr 2026.
  UPDATE payments SET booking_id = <id> WHERE id IN (16988, 16989);

Payment 17187:
  Query Fidelo/HubSpot for deal linked to TransferMate transfer D2026226.
  UPDATE payments SET booking_id = <id> WHERE id = 17187;

Payment 4781: EUR 380 Flywire Aug 2019 -- no matching booking, consider archiving.

RISK: accounts | Reversible: Yes | Blast radius: 3 payments
STATUS: Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC