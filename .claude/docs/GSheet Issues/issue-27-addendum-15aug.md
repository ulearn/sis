# Issue 27 — Sofiia Korkishchenko (bk17909 cancelled anomaly)

Reporter: PG | Area: Booking/Class | Sheet row: 28

## Root cause (15 Aug 2026 UTC — 50th check, unchanged from 14 Aug)

- Booking 17909: CANCELLED, confirmed = true (anomaly), amountPaid = 0, amountOpen = EUR 727.50, no payment records; last updated 2026-06-17 (60 days ago)
- Booking Course 24693 (Renewal - AY PM, ends 13 Nov 2026): active = true, 0 class assignments
- Student enrolled correctly via Booking 17849 / BC 24623 — no operational impact
- Same booking tracked under Issue 7 (row 8)

## Fix recipe (NOT YET RUN)

1. UPDATE booking SET confirmed = false WHERE id = 17909;
2. UPDATE booking_course SET active = false WHERE id = 24693;

Reversible. No blast radius — student has live separate booking 17849.

## Status

Unchanged. Fix NOT RUN.
Last checked: 15 Aug 2026 UTC (50th check)
