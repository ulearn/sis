# Issue 21 — Maurivan Kuhl — Addendum 12 Aug 2026

**Sheet row:** 22 | **Reporter:** PG | **Check:** 20th hourly Wed 12 Aug 2026 UTC

**CORRECTION from prior checks:** Previously stated "No SCAs on BC 1604 — safe to deactivate." BC 1604 actually has 2 historical class assignments:
- SCA 46: weekStart 2026-03-30, weekEnd 2026-04-05, classId 7
- SCA 156: weekStart 2026-04-06, weekEnd 2026-07-02, classId 8 (bulk 12-week span)

Both SCAs are historical (course ended Jul 3, 2026). Deactivating BC 1604 will NOT delete these SCAs. Safe to proceed.

**Current State (12 Aug 2026):**
- BC 1604: endDate 2026-07-03, active = true — 40 days stale
- 2 historical class assignments present

**Fix Recipe (NOT YET RUN):**
UPDATE BookingCourse SET active = false WHERE id = 1604;

**Risk:** data-hygiene | Reversible: yes | Blast radius: 1 BC
**Status:** Open — fix NOT RUN. Day 40.
**Last checked:** Wed 12 Aug 2026 UTC (20th check)