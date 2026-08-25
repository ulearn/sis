# Issue 36b — Pietro Caccianiga Accommodation (452nd check, 22 Aug 2026)

**Sheet row:** 38

## Root cause
- BA 11311 (bed 84, booking 17980, Pietro Caccianiga student 14521): Jun 28 – 22 Aug 2026, fee EUR 3,850, active = true — checkout TODAY, not deactivated. Last updated 10 Aug.
- BA 11393 (bed 88, booking 17980): 22 Aug – 13 Sep, fee = null, active = true — new occupancy starts today, fee unset.
- Booking 17980: CONFIRMED, confirmed = true, fully paid EUR 5,331.
- No change from 451st check (5am today). Fix not run despite 7 checks today.

## Fix recipe (NOT YET RUN)
- Deactivate BA 11311: UPDATE booking_accommodation SET active = false WHERE id = 11311;
- Set fee on BA 11393: UPDATE booking_accommodation SET fee = <calc> WHERE id = 11393;
- Verify: SELECT id, bed_id, start_date, end_date, fee, active FROM booking_accommodation WHERE id IN (11311, 11393);

## Risk
Accommodations/data-hygiene. Reversible. Single booking 17980.

**Last checked:** Sat 22 Aug 2026 UTC (452nd, 7th today)
