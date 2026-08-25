# Issue 15 Addendum 8 Aug 2026-h

**Check:** 73rd (Sat 8 Aug 2026 UTC)  Sheet row: 16

## Root Cause - unchanged from 72nd check

- Booking 18151 (Saikhantes Shagdarsuren, student 1001): CONFIRMED, confirmed=true, fully paid EUR 1,339.20
- service_end = 2026-08-07 - expired 1 day ago; portal blocked
- Booking Course 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active=true, end date correct
- Holiday record 2500: 20 Jul to 21 Aug 2026 - student returns Mon 24 Aug
- service_end was not extended when holiday was added; correct value = BC end date = 2026-10-02

## Fix (NOT YET RUN)

  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

Portal unblocks immediately on next login. Not urgent today but must run before Mon 24 Aug.

## Risk: Single booking row. Reversible. Low blast radius.

## Status: Open. NOT YET RUN. Portal blocked, student on holiday until 24 Aug.

## Last Checked: Sat 8 Aug 2026 UTC (73rd check)