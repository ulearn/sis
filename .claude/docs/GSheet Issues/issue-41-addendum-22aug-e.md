# Issue 41 — Giampaolo Russo Accommodation (452nd check, 22 Aug 2026)

**Sheet row:** 43

## Root cause
- BA 11357 (bed 178, booking 18180, Giampaolo Russo student 14571): Aug 2–15, fee EUR 1,250, active = true — 7 days stale.
- BA 11396 (bed 44): Aug 15–22 Aug (today), fee = null, active = true — checkout TODAY, not deactivated.
- BA 11397 (bed 89): 22 Aug – 6 Sep, fee = null, active = true — new occupancy starts today, fee unset.
- Booking 18180: CONFIRMED, confirmed = true, fully paid EUR 2,584.96.
- No change from 451st check (5am today). Fix not run despite 7 checks today.

## Fix recipe (NOT YET RUN)
- Deactivate BA 11357 + 11396: UPDATE booking_accommodation SET active = false WHERE id IN (11357, 11396);
- Set fees: UPDATE booking_accommodation SET fee = <amount> WHERE id = 11396; (1wk bed44)
              UPDATE booking_accommodation SET fee = <amount> WHERE id = 11397; (2wk bed89)
- Verify: SELECT id, bed_id, start_date, end_date, fee, active FROM booking_accommodation WHERE id IN (11357, 11396, 11397);

## Risk
Accommodations/data-hygiene. Reversible. Single booking 18180.

**Last checked:** Sat 22 Aug 2026 UTC (452nd, 7th today)
