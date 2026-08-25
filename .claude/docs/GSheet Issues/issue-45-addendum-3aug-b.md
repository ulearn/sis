Issue 45 -- Renewal Students Arrivals List -- 21st check Mon 3 Aug 2026 UTC (3rd today)

Reporter: AC | Area: Renewal Students | Sheet row: 47

SYMPTOM:
Returning/renewal students not appearing on arrivals list; stale booking courses pollute the arrivals query.

ROOT CAUSE (confirmed 2026-08-03 UTC, 21st check):
- Active booking courses with end_date < 2026-08-04: 24,467 (confirmed fresh this check)
- Was 24,466 at previous check; BC 25006 (General English AM Plus, booking 18228) ended today Aug 3 -- now included
- BC 25006: end_date = 2026-08-03, active = true -- stale as of midnight tonight
- Neil decision still pending: Option A (bulk all) vs Option B (named 27-item subset)

FIX RECIPE (NOT YET RUN):
Earliest safe run: 2026-08-04 00:00 UTC (to fully include BC 25006)

Option A -- Bulk deactivate all stale booking courses (recommended):
  UPDATE booking_courses SET active = false WHERE end_date < 2026-08-04 AND active = true;
  Verify: SELECT COUNT(*) FROM booking_courses WHERE end_date < 2026-08-04 AND active = true;
  Expected: 0 rows remaining. Expected rows affected: 24,467.

Option B -- Named 27-item subset (see issue-45-renewal-no-class.md for IDs):
  UPDATE booking_courses SET active = false WHERE id IN ([list from recipe]);
  Does NOT resolve the broader stale backlog.

Note: Option A also resolves stale booking courses in Issues 7, 8, 10, 11, 12, 16, 19, 21, 22, 23, 26, 30, 43 and others.

RISK:
Data-hygiene. 24,467 records; all genuinely stale (end_date in past). Reversible (SET active=true). Neil decision required.

STATUS:
NOT RUN -- 21st check, 3rd today Mon 3 Aug 2026 UTC. Awaiting Neil decision.
Last checked: 2026-08-03 UTC
