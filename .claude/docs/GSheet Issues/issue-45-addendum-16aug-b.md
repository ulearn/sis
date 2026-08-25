issue 45 — Stale Booking Courses bulk deactivation (319th run, 16 Aug 2026 UTC)

Reporter: staff | Area: Booking/Class | Row: 47

SYMPTOM
Renewal students not appearing on arrivals list. Root cause: massive backlog of stale active BCs.

ROOT CAUSE (live, 319th run)

Active Booking Courses with endDate before 16 Aug 2026: 24,497 (unchanged from previous run)
18 Booking Courses ended 14-15 Aug 2026 (already included in 24,497 count)
Bulk deactivation script prepared but not yet run.

FIX RECIPE (NOT YET RUN)

Run the bulk deactivation (previous recipe issue-45-addendum-16aug.md has full script).
Verify count first:
  SELECT COUNT(*) FROM booking_courses WHERE end_date < NOW() AND active = true;

Deactivate all stale BCs (confirm count matches ~24,497 before running):
  UPDATE booking_courses SET active = false WHERE end_date < NOW() AND active = true;

WARNING: This affects 24,497 rows. Run in a transaction and verify with a SELECT first.
Consider running in batches of 1,000 to avoid lock contention.

Exceptions to check before running:
  Issue 8 BCs (1482, 1483, 1485, 1486, 1487, 1488) — stale but may have active cert implications
  Issue 10 BC 107 and BC 24793 — stale (1 class assignment each, historical)
  Issue 45 BC 1810 — NOT stale (ends 1 Jan 2027), 0 SCAs (separate issue 48)

RISK
Category: data-hygiene. High row count (24,497). Reversible (SET active=true).
Run in transaction. Impact: arrivals list will show correct active students.

STATUS
319th run, 16 Aug 2026 UTC. Fix NOT RUN. Count unchanged at 24,497.