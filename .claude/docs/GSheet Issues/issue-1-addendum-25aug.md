Issue 1 -- Orphan Payments (Addendum 25 Aug 2026)

Reporter: NM | Area: Cleanup | Sheet row: 2
Last checked: 2026-08-25 UTC (519th run)

STATUS: 6 orphan payments -- all still unlinked (UNCHANGED since 510th run)

All 6 Orphan Payments:
1. P4781: EUR 380, Flywire, 2019-08-20, dataSource = FIDELO, fideloPaymentId 32056
   comment: ULS771773625 / 21022 -- 2019 Fidelo migration orphan
2. P16988: EUR 339.90, Bank, Apr 2026, dataSource = HUBSPOT, bookingId = null
   linkable to booking 17856 (Margherita Galbusera)
3. P16989: EUR 339.90, Bank, Apr 2026, dataSource = HUBSPOT, bookingId = null
   linkable to booking 17857 (Francesca Fassina)
4. P17187: EUR 6,151, TransferMate Escrow, May 2026, dataSource = FIDELO, comment = ULEARNP2026124
   linkable via HubSpot deal ULEARNP2026124
5. P18122: EUR 250, Card, 23 Aug 2026 (2 days ago), dataSource = HUBSPOT, bookingId = null
   clearance deposit -- student identity unknown
6. P18123: EUR 250, Card, 23 Aug 2026 (2 days ago, 56-min gap after P18122), dataSource = HUBSPOT
   clearance deposit -- student identity unknown

P18122 and P18123 are now 2 days old. Investigate via HubSpot Commerce payment records.

FIX RECIPE (NOT YET RUN)
1. Link P16988 to booking 17856:
   UPDATE payment SET booking_id = 17856 WHERE id = 16988;
2. Link P16989 to booking 17857:
   UPDATE payment SET booking_id = 17857 WHERE id = 16989;
3. Investigate P17187 via HubSpot deal ULEARNP2026124 -- then:
   UPDATE payment SET booking_id = <deal_booking_id> WHERE id = 17187;
4. Identify P18122 + P18123 via HubSpot Commerce (EUR 250 card, 23 Aug 2026) -- link to booking.
5. P4781: trace via fideloPaymentId 32056 / ULS771773625 in Fidelo export.
   If no matching booking: flag for write-off (2019 pre-migration, EUR 380).

RISK: Accounts / cleanup. All reversible. P4781 may need write-off approval.

STATUS: Fix NOT RUN. Count = 6 (corrected from 5 in 510th run).
