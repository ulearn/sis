# Issue 15 Addendum 8 Aug 2026-f

**Check:** 71st (Sat 8 Aug 2026 UTC) **Sheet row:** 16

## Root Cause -- unchanged from 70th check

- Booking 18151 (Saikhantes Shagdarsuren, student 1001): CONFIRMED, confirmed = true, fully paid EUR 1,339.20
- service_end = 2026-08-07 -- expired 1 day ago (now day 2 of portal block)
- Booking Course 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active = true
- Holiday 2500: 20 Jul to 21 Aug 2026 -- student returns Mon 24 Aug (16 days from now)
- service_end was not extended to match Booking Course end date when holiday was added

## Fix (NOT YET RUN)

Run via Prisma or raw SQL (verify table name first):

  UPDATE booking SET service_end = '2026-10-02' WHERE id = 18151;

Verify:
  SELECT id, service_end FROM booking WHERE id = 18151;
  -- Expected: 2026-10-02

## Risk

Bookings / portal access. Single row. Fully reversible (date update only). Not urgent today -- student on holiday until 24 Aug. Must run before Mon 24 Aug.

## Status

Open. NOT YET RUN. Portal blocked day 2.

## Last Checked

Sat 8 Aug 2026 UTC (71st check)