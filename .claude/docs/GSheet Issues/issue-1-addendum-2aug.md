Issue 1 - Orphan payments (128th check)
Reporter: NM | Area: Cleanup | Sheet row: 2

Root cause (2 Aug 2026 UTC - 2nd check today)
4 orphan payments still unlinked (bookingId=null):
- Payment 16988: EUR 339.90, Bank Transfer, HubSpot payment ID 1204827374829, Apr 28 2026 (97 days)
- Payment 16989: EUR 339.90, Bank Transfer, HubSpot payment ID 1204846469317, Apr 28 2026 (97 days)
- Payment 17187: EUR 6151, TransferMate Escrow, fidelo payment ID 37587, txnId D2026226, May 1 2026 (93 days)
- Payment 4781: EUR 380, Flywire, txnId D20191404, Aug 20 2019 (legacy ~7 years)
- Cross-reference: Bookings 17856+17857 (Issue 48) still 0 payments; 16988+16989 are likely the match (EUR 339.90 x2, same Apr 28 date)

Fix recipe - NOT YET RUN (see issue-1-addendum-1aug-b.md for full context)

Step 1: Verify HubSpot payments 1204827374829 + 1204846469317 against Galbusera/Fassina bookings 17856+17857
Step 2: UPDATE payments SET booking_id=17856 WHERE id=16988; (NOT YET RUN)
        UPDATE payments SET booking_id=17857 WHERE id=16989; (NOT YET RUN)
Step 3: Locate booking for payment 17187 via fidelo payment ID 37587 or txnId D2026226
Step 4: Payment 4781 (7yr legacy) - confirm with Neil; likely safe to write off

Risk: Payments (money). Reversible. 4 payments, up to 4 bookings affected.
Status: OPEN - fix NOT RUN - Last checked: Sun 2 Aug 2026 UTC (128th check, 2nd today)