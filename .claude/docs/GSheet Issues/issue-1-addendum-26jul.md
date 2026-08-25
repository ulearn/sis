# Issue 1 — Orphan Payments (106th check, 26 Jul 2026)

Sheet row: 2.

## Root cause (26 Jul 2026 UTC)
- Payment 16988: EUR 339.90, Bank, created Apr 28 2026 (89 days), bookingId=null, hubspotPaymentId=1204827374829
- Payment 16989: EUR 339.90, Bank, created Apr 28 2026 (89 days), bookingId=null, hubspotPaymentId=1204846469317
- Payment 17187: EUR 6151.00, TransferMate Escrow, created May 5 2026 (82 days), bookingId=null, fideloPaymentId=37587
- Payment 4781: EUR 380, Flywire, Aug 2019, legacy/unresolvable, fideloPaymentId=32056

Note: previous recipe stated PMT 17187 created May 1; DB shows May 5 (82 days, not 86).

## Fix — NOT YET RUN
1. Link 16988+16989 to correct booking (use hubspotPaymentId to find deal in HubSpot)
2. Investigate fideloPaymentId=37587 on pmt 17187 — find associated booking via Fidelo/HubSpot
3. Payment 4781 (2019): likely unresolvable legacy; consider writing off or archiving

## Risk
money; reversible; 89d+ without booking linkage.

## Status
OPEN. 4 orphan payments unchanged. Fix NOT RUN.
Last checked: 26 Jul 2026 UTC (106th hrly)
