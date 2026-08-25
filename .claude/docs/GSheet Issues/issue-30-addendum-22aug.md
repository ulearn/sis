# Issue 30 addendum 22 Aug 2026

## 135th check - day counts updated

BC 104 (Morning General Plus, bk94): active=true, ended 26 Jun 2026 -- 57 DAYS STALE
BK 94 (Giulia Avallone, student 88): CONFIRMED, amountPaid=EUR 1,151.50
PMT 17102: EUR 1,151.50, bk94, paymentDate=13 Mar 2026, xeroId=null -- 162 DAYS UNRECONCILED
PMT 945: EUR 4,231, bk79, paymentDate=30 Jan 2026, xeroId=null -- 204 DAYS UNRECONCILED

Milena Vinci: NOT FOUND in student table (searched by lastName=Vinci). Either removed or stored under different surname.

## Fix (NOT YET RUN)
1. Deactivate BC 104 (57d stale, bk94)
2. Reconcile PMT 17102 (EUR 1,151.50, bk94) in Xero
3. Reconcile PMT 945 (EUR 4,231, bk79) in Xero
4. Verify Milena Vinci record -- search by email or first name

Risk: money (Xero reconciliation) + data-hygiene; reversible.
Last checked: 2026-08-22 UTC (135th check)
