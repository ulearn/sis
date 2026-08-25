# Issue 1 — 36th Hourly (Wed 22 Jul 2026 UTC)
Row 2. 92nd check. UNCHANGED.

## Orphan payments (bookingId=null)
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 — 85 days, xeroPaymentId=null
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 — 85 days, xeroPaymentId=null
- Payment 17187: EUR 6151, TransferMate Escrow, 1 May 2026 — 82 days, xeroPaymentId=null
- Payment 4781: EUR 380, Flywire, legacy record — ~103 days, xeroPaymentId=null

## Stale active records
- Booking courses active=true with end date before 22 Jul 2026: 24,436
- Booking accommodations active=true with end date before 22 Jul 2026: 11,175

## Fix (NOT YET RUN)
1. Investigate each orphan payment: identify correct booking and link via bookingId
2. Run deactivation script for stale booking courses and booking accommodations
See: issue-1-orphan-payments.md for detailed recipe

Status: OPEN. Last checked: Wed 22 Jul 2026 (36th hrly, 92nd check).
