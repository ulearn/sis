# Issue 11 Addendum 8 Aug 2026

**Check:** 15th (Sat 8 Aug 2026 UTC)  Sheet row: 12

## Status -- unchanged from 14th check (Fri 7 Aug)

- Student 1063 (Valeriya Salauyova): HubSpot contact ID = null, visa status = null, DOB 25 May 2010 (minor, age 16)
- Booking 17912: CONFIRMED, confirmed = true, fully paid EUR 1,938
- Booking Course 24696 (General English AM Plus, Jun 8 to Jul 3 2026): active = true -- 36 days stale
- Course complete; student is not a continuing student (no new booking)

## Fix (NOT YET RUN)

1. Deactivate BC 24696: UPDATE booking_course SET active = false WHERE id = 24696
2. Backfill HubSpot contact ID for student 1063 (check HubSpot deal for correct contact ID)

## Risk: data-hygiene. Reversible. No financial or document impact.

## Status: Open. NOT YET RUN. BC 24696 36 days stale.

## Last Checked: Sat 8 Aug 2026 UTC (15th check)