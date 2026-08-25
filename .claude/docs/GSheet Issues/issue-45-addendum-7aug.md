Issue 45 - Stale Active Booking Courses (34th check)
Reporter: AC | Area: Renewal students | Sheet row: 47

Status Update: Fri 7 Aug 2026 UTC (34th check)
Count UNCHANGED at 24,466 stale active Booking Courses. No decision made.

Current State (live as of this check)
- Total stale active Booking Courses: 24,466 (active=true AND endDate < today)
- Most recently ended (still active):
  BC 25006 (General English AM Plus, bk 18228): ended 3 Aug 2026 - 4 days stale, 2 SCAs
  BC 24697 (Academic Year Morning, bk 17915): ended 31 Jul 2026 - 7 days stale
  BC 1454 (Academic Year Afternoon, bk 1368): ended 31 Jul 2026 - 7 days stale
  BC 24616 (General English AM Plus, bk 17842): ended 31 Jul 2026 - 7 days stale
  BC 87 (Intensive General 30, bk 82): ended 31 Jul 2026 - 7 days stale
  + 5 more ended 31 Jul 2026

Fix Recipe (NOT YET RUN)
Option A - Bulk deactivate (recommended):
  Verify: SELECT COUNT(*) FROM booking_courses WHERE active=true AND end_date < NOW();
  Run: UPDATE booking_courses SET active=false, updated_at=NOW() WHERE active=true AND end_date < NOW();
  Expected ~24,466 rows. Recommend DB backup before running.

Option B - Phased (conservative):
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE active=true AND end_date < NOW() - INTERVAL '1 year';
  Repeat with shorter intervals after confirming no regressions.

Option C - Add nightly automated job for ongoing hygiene.

Risk: data hygiene | reversible (SET active=true to undo) | cosmetic only (no portal or document impact) | backup recommended.
Status: Fix NOT RUN. Awaiting decision. Last checked: Fri 7 Aug 2026 UTC (34th hourly check).