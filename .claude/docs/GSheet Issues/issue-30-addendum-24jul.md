# Issue 30 — Giulia Avallone — Stale BC + EUR 1151.50 Xero Null (80 Days)
Reporter: NM | Area: Booking | Sheet row: 31

## Root Cause (Fri 24 Jul 2026 UTC — 40th hourly check — UNCHANGED)
- Booking course 104 (Morning General Plus, booking 94, ended 26 Jun 2026): active=true — 28 days stale
- Payment 17102 (EUR 1151.50, booking 94, Giulia Avallone): created 5 May 2026, type=null, xeroPaymentId=null — 80 days unreconciled in Xero

## Fix (NOT YET RUN)
1. UPDATE BookingCourse SET active=false, updatedAt=NOW() WHERE id=104
2. Locate Xero payment for EUR 1151.50 around May 5 2026 (booking 94) in Hub fins/
3. UPDATE Payment SET type=one_time_or_initial, xeroPaymentId=<xero_id>, updatedAt=NOW() WHERE id=17102
See also: issue-30-giulia-milena-parent-student.md

## Risk: EUR 1151.50 Xero null 80d — MEDIUM. Stale BC cosmetic. Reversible.
## Status: UNCHANGED — BC104 28d stale, Pmt17102 Xero null 80d. Fix NOT RUN. Fri 24 Jul 2026 UTC
