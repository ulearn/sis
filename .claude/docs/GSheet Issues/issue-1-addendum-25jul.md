# Issue 1 -- Orphan Payments -- Addendum 25 Jul 2026

Reporter: NM | Area: Cleanup | Sheet row: 2
Checked: Sat 25 Jul 2026 UTC -- 63rd hourly check, 160th total run

## CURRENT STATUS -- 4 ORPHAN PAYMENTS; staleBCs DROPPED 1,246

Orphan payments (bookingId = null):
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 -- 88 days orphaned
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 -- 88 days orphaned
- Payment 17187: EUR 6,151.00, TransferMate Escrow, 1 May 2026
  fideloPaymentId = 37587, transactionId = D2026226 -- 85 days orphaned
- Payment 4781: EUR 380.00, Flywire, 20 Aug 2019 -- fideloPaymentId = 32056 -- permanently unresolvable

Stale booking courses (confirmed bookings, past end date): 23,190
  NOTE: was 24,436 in all previous reports -- dropped by 1,246 this run.
  Possible cleanup by Neil, or query difference. Verify if intentional.

Stale booking accommodations with active beds: 43 -- unchanged

## FIX RECIPE (NOT YET RUN)

Payments 16988 + 16989:
  Search HubSpot for deal with EUR 339.90 Bank receipt around 28 Apr 2026.
  Link to the correct booking in SIS (UPDATE payments SET booking_id = X WHERE id IN (16988, 16989)).

Payment 17187:
  Search HubSpot for deal linked to TransferMate ref D2026226 (fideloId 37587).
  Link to correct booking (UPDATE payments SET booking_id = X WHERE id = 17187).

Payment 4781: EUR 380 Flywire Aug 2019 -- no matching booking. Consider archiving/writing off.

Stale BCs: 23,190 entries need booking_course.active set to false after end date.
  Run: UPDATE booking_courses SET active = false WHERE end_date < NOW() AND active = true (in batches).
  (NOT YET RUN)

## RISK / CATEGORY

accounts | Reversible: Yes | Blast radius: 3 live payments + 23,190 stale BCs

## STATUS

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC
staleBCs: 23,190 (was 24,436 -- verify change). 4 orphan payments unchanged.