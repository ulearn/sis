# Issue 1 — Orphan Payments (165th check)
Reporter: NM | Area: Cleanup | Sheet row: 2

## Root Cause (verified 16:02 UTC Thu 6 Aug 2026)
4 orphan payments (booking_id = NULL) unchanged:
  ID 4781: EUR 380, Flywire, 20 Aug 2019 (legacy Fidelo, 2543d orphaned)
  ID 16988: EUR 339.90, Bank, 28 Apr 2026 (101d orphaned)
  ID 16989: EUR 339.90, Bank, 28 Apr 2026 (101d orphaned)
  ID 17187: EUR 6,151, TransferMate Escrow, 1 May 2026, txid D2026226 (97d orphaned)

Bookings 17856 and 17857 still unlinked:
  Booking 17856: CONFIRMED, confirmed=false, amount_paid=EUR 339.90, no payments linked
  Booking 17857: CONFIRMED, confirmed=false, amount_paid=EUR 339.90, no payments linked
  Both last updated 2026-07-08.

## Fix Recipe (NOT YET RUN)
Link payment 16988 to booking 17856 (or 17857) and payment 16989 to the other.
Set confirmed=true on both bookings after linking payments.
Investigate payment 17187 (EUR 6,151 TransferMate Escrow) — find associated booking.
Payment 4781 (EUR 380 Flywire 2019) — likely legacy; check if safe to void/write-off.
See prior recipe: issue-1-addendum-6aug-d.md for full SQL.

## Status
Fix NOT RUN. 4 orphan payments, 101d max (excl. legacy). Last checked: 16:02 UTC Thu 6 Aug 2026