# Issue 45 — Bulk Stale Booking Courses (28th check Wed 5 Aug 2026 UTC)
Reporter: AC | Area: Renewal students | Sheet row: 47

## Root Cause (verified 2026-08-05 UTC)
- 24,467 booking courses have end_date < 2026-08-05 AND active = true — count UNCHANGED from yesterday
- Booking course 25006 (Marina Larripa, General English AM Plus, ended 2026-08-03): active = true — 2 days stale, has 2 class assignments
- All Issue 38 booking courses (future end dates Aug 7 / Aug 14) NOT in count — safe
- Bulk deactivation still awaiting decision from Neil

## Fix Recipe (NOT YET RUN)

Step 1 - Verify count:
  SELECT COUNT(*) FROM booking_courses WHERE end_date < '2026-08-05' AND active = true;
  -- Expect: ~24,467

Step 2 - Bulk deactivate:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE end_date < '2026-08-05' AND active = true;

Step 3 - Verify:
  SELECT COUNT(*) FROM booking_courses WHERE end_date < '2026-08-05' AND active = true;
  -- Expect: 0

## Risk
Category: data-hygiene | Reversible: yes | Blast: ~24,467 historical/ended rows
Safe to run at any time. Recommend running Issue 38 fix first (cleanliness, not required).

## Status: NOT RUN. Awaiting decision. Last checked: 2026-08-05 UTC (28th check)