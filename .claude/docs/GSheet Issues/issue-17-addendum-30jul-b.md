## Issue 17 — Ana Jessica Rosa de Paula Santos: Cancelled, Payments Unreconciled
Reporter: PG | Area: Booking | Sheet row: 18

## Root cause (Thu 30 Jul 2026 UTC — 14th check)
- Booking 1308: CANCELLED, confirmed=false
- amountPaid = EUR 1,530 / amountTotal = EUR 1,530 (fully paid before cancellation)
- BC1350: ends 2026-11-13, active=true (stale — still active despite CANCELLED)
- Payment 17186: EUR 1,280, Bank Transfer, 2026-05-05, xeroPaymentId=null
- Payment 17050: EUR 250, Bank Transfer, 2026-05-05, xeroPaymentId=null
- Both payments unreconciled in Xero (xeroPaymentId=null)

## Fix recipe — NOT YET RUN

### Option A: Reinstate (if cancellation was accidental)
UPDATE bookings SET status = CONFIRMED, confirmed = true WHERE id = 1308;
(Then reconcile payments 17186 + 17050 in Xero)

### Option B: Finalise cancellation
UPDATE booking_courses SET active = false WHERE id = 1350;
(Create Xero credit note / refund for EUR 1,530)

### Reconcile in Xero (either option)
1. Find bank transactions EUR 1,280 + EUR 250 from ~5 May 2026
2. Match to booking 1308 / Ana Jessica Rosa de Paula Santos
3. If reinstated: allocate to invoice; if cancelled: create credit note

## Risk
Financial — EUR 1,530 unreconciled 86+ days; reversible
Blast radius: 1 student, 2 payments, 1 BC

## Status
Fix NOT RUN. Day 86 unreconciled (May 5). BC1350 still active. Both xeroId=null.
Last checked: Thu 30 Jul 2026 UTC (14th check)