# Issue 30 - Giulia Avallone / Milena Vinci (129th check)
Reporter: Staff | Area: Booking/Xero | Sheet row: 31 | Sun 16 Aug 2026 UTC

Symptom: Mother Milena Vinci listed as student; Xero payments unreconciled.

Root Cause (129th check - 16 Aug 2026 UTC):
- BC 104 (Morning General Plus): active, ended 2026-06-26 - 51 days stale, SCA 270 historical
- Booking 94 (Giulia): CONFIRMED, confirmed=true, fully paid EUR 1,151.50
- Payment 17102 (bk 94): EUR 1,151.50, xeroPaymentId=null - 156 days unreconciled (paid 2026-03-13)
- Payment 945 (bk 79, Milena): EUR 4,231, xeroPaymentId=null - 198 days unreconciled (paid 2026-01-30)
- No change from 128th check (Sat 15 Aug). Day counts +1.

Fix Recipe (NOT YET RUN):
1. Deactivate BC 104: UPDATE BookingCourse SET active=false WHERE id=104
2. Reconcile payment 17102 (EUR 1,151.50) in Xero against booking 94 invoice
3. Reconcile payment 945 (EUR 4,231) in Xero against booking 79 invoice (Milena)

Risk: Money | Reversible | 156d+198d aging Xero gap - prioritise next Xero session
Status: Open - fix NOT RUN | Last checked: Sun 16 Aug 2026 UTC
