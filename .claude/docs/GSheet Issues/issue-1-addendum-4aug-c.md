# Issue 1 — Orphan Payments + Stale Booking Courses (141st check Tue 4 Aug 2026 UTC)
Reporter: NM | Area: Cleanup | Sheet row: 2

## Root Cause (confirmed 2026-08-04 UTC)
- Payment 16988: EUR 339.90, booking_id=null, xero_payment_id=null, payment_date=2026-04-28
- Payment 16989: EUR 339.90, booking_id=null, xero_payment_id=null, payment_date=2026-04-28
- Payment 17187: EUR 6,151, transaction_id=D2026226, booking_id=null, payment_date=2026-05-01 — origin unknown
- Payment 4781: EUR 380, transaction_id=D20191404, payment_date=2019-08-20 — legacy 7yr record
- Booking course 24630 (Fassina, General English AM Plus, ended 2026-07-10): active=true — 25d stale
- Booking course 24631 (Galbusera, General English AM Plus, ended 2026-07-10): active=true — 25d stale
- Booking course 25006 (Marina Larripa, General English AM Plus, ended 2026-08-03): active=true — 1d stale
- Booking 17856: CONFIRMED, confirmed=false, amount_paid=EUR 339.90, amount_open=null
- Booking 17857: CONFIRMED, confirmed=false, amount_paid=EUR 339.90, amount_open=null

## Fix Recipe (NOT YET RUN)
1. UPDATE payments SET booking_id=17856 WHERE id=16988;
2. UPDATE payments SET booking_id=17857 WHERE id=16989;
3. UPDATE booking_courses SET active=false WHERE id IN (24630,24631,25006);
4. Investigate pmt 17187: SELECT id,status,amount_open FROM bookings WHERE amount_open BETWEEN 6000 AND 6400;
5. Payment 4781 (2019, EUR 380): Neil to decide archive/keep.

## Risk: money, bookings | Reversible: yes | 4 pmts, 3 BCs, 2 bookings

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (141st check)