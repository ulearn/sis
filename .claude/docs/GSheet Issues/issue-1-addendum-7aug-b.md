Issue 1 - Orphan Payments (175th check Fri 7 Aug 2026 UTC)

Root cause: 4 orphan payments. Pmts 16988/16989 match bks 17856/17857 (EUR 339.90 each). BCs 24630/24631 ended 10 Jul stale 28d.

Evidence:
- Pmt 4781: EUR 380 Flywire 20 Aug 2019 (2548d orphaned)
- Pmt 16988: EUR 339.90 Bank 28 Apr 2026 (102d booking_id=null)
- Pmt 16989: EUR 339.90 Bank 28 Apr 2026 (102d booking_id=null)
- Pmt 17187: EUR 6151 TransferMate Escrow 1 May 2026 (99d booking_id=null)
- BC 24630: active=true ended 10 Jul 2026 (28d stale 0 SCAs)
- BC 24631: active=true ended 10 Jul 2026 (28d stale 0 SCAs)

Fix recipe (NOT YET RUN):
1. Verify: bk 17856 = Margherita Galbusera; bk 17857 = second student
2. UPDATE payments SET booking_id = 17856 WHERE id = 16988;
3. UPDATE payments SET booking_id = 17857 WHERE id = 16989;
4. UPDATE bookings SET confirmed = true, amount_open = 0 WHERE id IN (17856, 17857);
5. UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);
6. Pmt 17187 EUR 6151: identify booking via TransferMate/HubSpot first
7. Pmt 4781 EUR 380 2019: Neil to decide write-off or leave

Risk: Financial - verify before running. Reversible. Status: UNRESOLVED