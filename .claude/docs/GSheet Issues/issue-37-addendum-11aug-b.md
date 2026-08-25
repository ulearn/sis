# Issue 37 Addendum 11 Aug 2026-b (22nd check)

Tue 11 Aug 2026 UTC. No change since 21st check.

## Current State -- Veronica Martin (student 278), bed 83

- Booking Accommodation 11239: ended 2026-05-24 -- 79 days stale, active=true, fee EUR 1,050
- Booking Accommodation 11168: ended 2026-06-20 -- 52 days stale, active=true, fee EUR 700
- Booking Accommodation 11285: ended 2026-07-05 -- 37 days stale, active=true, fee = null (NEEDS FEE)
- Booking Accommodation 11352: ended 2026-07-11 -- 31 days stale, active=true, fee EUR 360
- Booking Accommodation 11179: ended 2026-08-09 -- 2 days stale, active=true, fee EUR 1,360

## Fix Recipe (NOT YET RUN)

Step 1 -- Set missing fee on BA 11285 (confirm correct amount with Neil first):
  UPDATE booking_accommodations SET fee = <CONFIRM_AMOUNT> WHERE id = 11285;

Step 2 -- Deactivate all 5 stale BAs:
  UPDATE booking_accommodations SET active = false, updated_at = NOW()
  WHERE id IN (11239, 11168, 11285, 11352, 11179);

## Risk

- Category: bookings / accommodation data-hygiene | Reversible: yes
- Blast radius: 5 records on one student
- Fee on BA 11285 must be confirmed before deactivation

Status: Open -- 5 stale BAs (79d max), BA 11285 fee null. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (22nd check)