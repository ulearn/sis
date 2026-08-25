# Issue 30 Addendum 22 Jul 2026
Reporter: (various) | Row: 31 | 38th hourly (42nd total) Wed 22 Jul UTC

## Root Cause (fresh DB)
BC104 (Morning General Plus, BK94, Giulia Avallone, student 88):
- endDate=26 Jun 2026, active=STILL true - 26 days stale (was 25d yesterday)

Payment 17102 (BK94, Giulia Avallone, student 88):
- EUR 1151.50, xeroPaymentId=null, type=null - not reconciled in Xero

UNCHANGED from 37th hourly (Tue 21 Jul).

## Fix Recipe (NOT YET RUN)
1. UPDATE booking_course SET active=false WHERE id=104;
2. Reconcile pmt 17102 in Xero:
   Xero -> invoice for BK94 (Giulia Avallone, student 88) -> match EUR 1151.50
   Confirm type (likely bank transfer) before reconciling

## Risk
category: bookings/money/data-hygiene | reversible: yes | blast radius: EUR 1151.50 unreconciled; student 88

## Status
OPEN - fix NOT YET RUN. Last checked: Wed 22 Jul 2026 UTC (38th hrly / 42nd total)
