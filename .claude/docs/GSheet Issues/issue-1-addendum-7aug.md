Issue 1 - Orphan Payments (171st check)
Reporter: NM | Area: Cleanup | Sheet row: 2

Status Update: Fri 7 Aug 2026 UTC
UNCHANGED since 170th check. 4 orphan payments still bookingId=null. BCs 24630/24631 now 28 days stale.

Current State
- Payment 4781: EUR 380, Flywire, 20 Aug 2019 - 2,545 days orphaned (legacy Fidelo)
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 - 101 days orphaned, xeroPaymentId null
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 - 101 days orphaned, xeroPaymentId null
- Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026 - 98 days orphaned, txid D2026226, xeroPaymentId null
- Booking 17856: CONFIRMED, confirmed=false, amountPaid=339.90, 0 payments linked, BC 24631 ended 10 Jul (28d stale)
- Booking 17857: CONFIRMED, confirmed=false, amountPaid=339.90, 0 payments linked, BC 24630 ended 10 Jul (28d stale)

Fix Recipe (NOT YET RUN)
Step 1: UPDATE payments SET booking_id = 17856 WHERE id = 16988;
Step 2: UPDATE payments SET booking_id = 17857 WHERE id = 16989;
Step 3: UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);
Step 4: UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);
Step 5: Investigate payment 17187 (txid D2026226) in TransferMate/HubSpot to identify booking.
Step 6: Payment 4781 (Flywire 2019) - confirm with Neil before voiding.
Step 7 verify: SELECT id, booking_id FROM payments WHERE id IN (16988,16989,17187,4781);

Risk: data hygiene | reversible | 2 students affected | payment 17187 needs investigation first.
Status: Fix NOT RUN. Last checked: Fri 7 Aug 2026 UTC (171st hourly check).