# Issue 15 Addendum 8 Aug 2026-e

**Check:** 70th (Sat 8 Aug 2026 UTC) **Sheet row:** 16

## Root Cause
- Booking 18151 (Saikhantes Shagdarsuren, student 1001): CONFIRMED confirmed=true fully paid EUR 1339.20
- service_end = 2026-08-07 EXPIRED YESTERDAY. Portal blocked since today (8 Aug).
- Booking Course 24925 (AY Afternoon, 9 Mar to 2 Oct 2026): active=true
- Holiday 2500: 20 Jul to 21 Aug 2026. Student returns Mon 24 Aug.
- service_end was not extended when holiday was added.

## Fix (NOT YET RUN)

  UPDATE bookings SET service_end = 2026-10-02 WHERE id = 18151;

Verify: SELECT id, service_end FROM bookings WHERE id = 18151; -- Expected 2026-10-02

## Risk
Bookings/portal access. Single row, fully reversible. Not urgent today (student on holiday). Must fix before Aug 24.

## Status
Open NOT YET RUN (portal blocked day 1)

## Last Checked
Sat 8 Aug 2026 UTC (70th check)
