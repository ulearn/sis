# Issue 27 Addendum 8 Aug 2026

**Check:** 43rd (Sat 8 Aug 2026 UTC)  Sheet row: 28

## Status -- unchanged from 42nd check (Fri 7 Aug)

- Booking 17909 (Sofiia Korkishchenko, student 768): status = CANCELLED, confirmed = true -- anomaly
- Amount paid = EUR 0, amount open = EUR 727.50, no payment records
- Booking Course 24693 (Renewal Academic Year PM, 25 May to 13 Nov 2026): active = true on cancelled booking
- Booking last updated 17 Jun 2026 -- 52 days ago
- Student correctly enrolled on Booking 17849 (BC 24623: AY Renewal Afternoon, Jun 8 to Nov 27 2026)

Note: same booking 17909 anomaly also tracked under Issue 7 (row 8).

## Fix (NOT YET RUN)

1. UPDATE booking SET confirmed = false WHERE id = 17909;
2. UPDATE booking_course SET active = false WHERE id = 24693;

## Risk: data-hygiene. Reversible. No financial impact (EUR 0 paid, EUR 727.50 open on cancelled booking).

## Status: Open. NOT YET RUN. 52 days since booking last updated.

## Last Checked: Sat 8 Aug 2026 UTC (43rd check)