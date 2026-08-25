# Issue 19 Addendum 8 Aug 2026

**Check:** 6th (Sat 8 Aug 2026 UTC)  Sheet row: 20

## Status -- unchanged from 5th check (Fri 7 Aug)

- Booking Course 89 (Morning IELTS, booking 83, ended 22 May 2026): active = true -- 78 days stale
- Booking Course 90 (Private Lessons, booking 83, ended 22 May 2026): active = true -- 78 days stale
- Booking 83 (Mai Lan Chu): CONFIRMED, confirmed = true, EUR 2,629.80 paid, fully settled
- Both courses ended on same date (May 22); student did not continue

## Fix (NOT YET RUN)

  UPDATE booking_course SET active = false WHERE id IN (89, 90);

## Risk: data-hygiene. Reversible. No financial or document impact.

## Status: Open. NOT YET RUN. BCs 89 and 90 now 78 days stale.

## Last Checked: Sat 8 Aug 2026 UTC (6th check)