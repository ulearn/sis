Issue 1 -- Orphan Payments -- Addendum 25 Jul 2026 (run B)

Reporter: NM | Area: Cleanup | Sheet row: 2
Checked: Sat 25 Jul 2026 UTC -- 64th hourly check, 162nd total run

CURRENT STATUS -- 4 ORPHAN PAYMENTS; stale BCs UP 9 FROM MORNING CHECK

Orphan payments (bookingId = null) -- unchanged:
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 -- 88 days orphaned
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 -- 88 days orphaned
- Payment 17187: EUR 6,151.00, TransferMate Escrow, 5 May 2026 -- fideloPaymentId = 37587, transactionId = D2026226 -- 85 days orphaned
- Payment 4781: EUR 380.00, Flywire, Aug 2019 -- fideloPaymentId = 32056 -- permanently unresolvable

Stale booking courses (confirmed bookings, past end date): 23,199
  Was 23,190 in this morning check (+9 this hour).
  Was 24,436 before Sat 25 Jul (dropped 1,246 in morning run -- verify if Neil ran cleanup).

Stale booking accommodations with active beds: 43 -- unchanged

FIX RECIPE (NOT YET RUN)

Payments 16988 + 16989:
  Search HubSpot for deal with EUR 339.90 Bank receipt around 28 Apr 2026.
  Link to the correct booking in SIS: UPDATE payments SET booking_id = X WHERE id IN (16988, 16989)

Payment 17187:
  Search HubSpot for deal linked to TransferMate ref D2026226 (fideloId 37587).
  Link to correct booking: UPDATE payments SET booking_id = X WHERE id = 17187

Payment 4781: EUR 380 Flywire Aug 2019 -- no matching booking. Consider archiving/writing off.

Stale BCs: 23,199 entries -- run cleanup in batches (NOT YET RUN).

RISK / CATEGORY

accounts | Reversible: Yes | Blast radius: 3 live payments + 23,199 stale BCs

STATUS

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (run B)
staleBCs: 23,199 (+9 from 23,190 this morning). 4 orphan payments unchanged.