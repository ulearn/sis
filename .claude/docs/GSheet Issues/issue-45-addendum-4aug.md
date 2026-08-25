# Issue 45 - Bulk Stale Booking Courses (23rd check Tue 4 Aug 2026 UTC)
Reporter: AC | Area: Renewal students | Sheet row: 47

## Root Cause (fresh - 2026-08-04 UTC)
- 24,467 booking courses have end_date < 2026-08-04 AND active=true
- BC 25006 (Marina Larripa, ended Aug 3) newly in count (1 day stale)
- Issue 38 BCs (start Aug 3) NOT in count -- their end_dates are all after Aug 4
- Safe to run regardless of Issue 38 status

## Fix Recipe (NOT YET RUN)

Step 1 - Verify count:
  SELECT COUNT(*) FROM booking_courses WHERE end_date < '2026-08-04' AND active = true;
  -- Expect: 24,467

Step 2 - Bulk deactivate:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE end_date < '2026-08-04' AND active = true;

Step 3 - Verify:
  SELECT COUNT(*) FROM booking_courses WHERE end_date < '2026-08-04' AND active = true; -- Expect: 0

## Risk
Category: data-hygiene | Reversible: yes | Blast: 24,467 historical/ended rows
Safe to run at any time. Recommend running Issue 38 first (cleanliness, not required).

## Status: NOT RUN. Awaiting decision. Last checked: 2026-08-04 UTC