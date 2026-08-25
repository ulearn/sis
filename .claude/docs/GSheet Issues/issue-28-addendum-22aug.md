# Issue 28 addendum 22 Aug 2026

## 60th check - fresh DB data

BK 17850 (Paola Sthefane Moreira): CONFIRMED, confirmed=false (anomaly persists)
amountPaid=null, amountOpen=EUR 321.35
BK last updated: 8 Jul 2026

PMT 17519: EUR 321.35, paymentDate=7 May 2026, xeroId=null -- 107 DAYS UNRECONCILED
BC 24624 (Morning General): active=true, ended 5 Jun 2026 -- 78 DAYS STALE (newly counted)
0 SCAs on BC 24624

## Fix (NOT YET RUN)
1. prisma.booking.update id=17850 set amountPaid=321.35, confirmed=true
2. prisma.bookingCourse.update id=24624 set active=false (78d stale, no SCAs)
3. Reconcile PMT 17519 (EUR 321.35) in Xero

Note: BC 24624 ended Jun 5 -- Paola has no active course. Confirm student status before assigning to class.
Risk: money; reversible. Payment record exists so amountPaid update is safe.
Last checked: 2026-08-22 UTC (60th check)
