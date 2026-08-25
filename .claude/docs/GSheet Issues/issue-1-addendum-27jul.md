# Issue 1 -- Orphan Payments (108th check, 27 Jul 2026 UTC)

Sheet row: 2.

## Root cause (27 Jul 2026 UTC -- 108th hrly check)
- Payment 16988: EUR 339.90, Bank, created Apr 28 2026 (90 days), bookingId=null, hubspotPaymentId=1204827374829
- Payment 16989: EUR 339.90, Bank, created Apr 28 2026 (90 days), bookingId=null, hubspotPaymentId=1204846469317
- Payment 17187: EUR 6151.00, TransferMate Escrow, created May 5 2026 (82 days), bookingId=null, fideloPaymentId=37587
- Payment 4781: EUR 380, Flywire, created Apr 10 2026 (107 days), legacy/unresolvable, fideloPaymentId=32056

All 4 payments: date field = null; ages calculated from created_at.

## Fix -- NOT YET RUN
1. Link 16988+16989 to correct booking (use hubspotPaymentId to find deal in HubSpot)
2. Investigate fideloPaymentId=37587 on pmt 17187 -- find associated booking via Fidelo/HubSpot
3. Payment 4781 (Flywire legacy): likely unresolvable; consider writing off or archiving

## Risk
money; reversible; 90d+ without booking linkage.

## Status
OPEN. 4 orphan payments unchanged. Fix NOT RUN.
Last checked: 27 Jul 2026 UTC (108th hrly)