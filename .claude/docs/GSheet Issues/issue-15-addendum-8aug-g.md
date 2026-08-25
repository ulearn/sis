# Issue 15 Addendum 8 Aug 2026-g

**Check:** 72nd (Sat 8 Aug 2026 UTC)  Sheet row: 16

## Root Cause -- unchanged from 71st check

- Booking 18151 (Saikhantes Shagdarsuren, student 1001): CONFIRMED, fully paid EUR 1339.20
- service_end = 2026-08-07 -- expired 1 day ago, portal blocked day 2
- Booking Course 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active = true
- Holiday 2500: 20 Jul to 21 Aug 2026 -- student returns Mon 24 Aug
- service_end was not extended when holiday was added; should be 2026-10-02

## Fix (NOT YET RUN)

  UPDATE booking SET service_end = 2026-10-02 WHERE id = 18151

## Risk: bookings/portal. Single row, reversible. Not urgent today -- must run before 24 Aug.

## Status: Open. NOT YET RUN. Portal blocked day 2. Student on holiday.

## Last Checked: Sat 8 Aug 2026 UTC (72nd check)