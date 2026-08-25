# Issue 13 — Lizbeth del Carmen — Health Insurance Unpriced (60 Days)
Reporter: AC | Area: Booking | Sheet row: 14

## Root Cause (Fri 24 Jul 2026 UTC — 34th check — UNCHANGED)
- Booking extra 96 (booking 17981): details=PEL;Health, fee=null — 60 days unpriced since 25 May 2026
- Booking 17981: CONFIRMED, EUR 1407.50/1407.50 fully paid, amountOpen=null, confirmed=false — last updated 23 Jun 2026 (31d)
- Student attending since approx 1 Jun 2026 — about 53 school days without arranged insurance

## Fix (NOT YET RUN)
1. Confirm insurance fee with finance/Neil
2. UPDATE BookingExtra SET fee=<confirmed_fee>, updatedAt=NOW() WHERE id=96
3. UPDATE Booking SET confirmed=true, confirmedAt=NOW(), updatedAt=NOW() WHERE id=17981
4. Revoke and re-issue invoice for booking 17981

## Risk: Insurance gap — MEDIUM. Invoice re-issue needed. Reversible.
## Status: UNCHANGED — fee null 60d, booking confirmed=false. Fix NOT RUN. Fri 24 Jul 2026 UTC
