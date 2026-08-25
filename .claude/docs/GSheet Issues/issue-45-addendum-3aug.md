# Issue 45 — Renewal Students Arrivals List — 19th check Mon 3 Aug 2026 UTC (1st today)

Reporter: AC | Area: Renewal Students | Sheet row: 47

## Symptom
Returning/renewal students not appearing on arrivals list; stale booking courses pollute the arrivals query.

## Root Cause (confirmed 2026-08-03 UTC, 19th check)
- 24,466 active booking courses with end_date < 2026-08-03 (ended before today) — unchanged from yesterday.
- BC 25006 (General English AM Plus, booking 18228): end_date = 2026-08-03, active = true — ends today (Aug 3, bank holiday).
  After today this becomes 24,467 stale booking courses.
- Stale booking courses mask newly-starting renewal students in the arrivals-list query.
- Neil decision still pending: Option A (bulk all) vs Option B (named 27-item subset).

## Fix Recipe — NOT YET RUN

Option A — Bulk deactivate all stale booking courses (recommended):
  Run on or after 2026-08-04 to also capture BC 25006 (ends Aug 3):
  UPDATE booking_courses SET active = false WHERE end_date < 2026-08-04 AND active = true;
  Verify: SELECT COUNT(*) FROM booking_courses WHERE end_date < 2026-08-04 AND active = true; -- expect 0
  Expected rows affected: ~24,467.

Option B — Named 27-item subset (see issue-45-renewal-no-class.md for IDs):
  UPDATE booking_courses SET active = false WHERE id IN ([list]);
  Does NOT resolve the broader stale backlog.

Note: Option A also resolves stale booking courses in Issues 7, 8, 10, 11, 12, 16, 19, 21, 22, 23, 26, 30, 43 and more.

Risk: Bookings/data-hygiene. ~24,467 records; all genuinely stale. Reversible (SET active=true). Neil decision required.

Status: NOT RUN — 19th check, 1st today Mon 3 Aug 2026 UTC. Awaiting Neil decision.
Last checked: 2026-08-03 UTC