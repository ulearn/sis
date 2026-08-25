Issue 45 Stale Booking Courses (110th check, 19 Aug 2026)
Sheet row: 47  Reporter: NM  Area: Renewal students

Symptom: Renewal students not appearing on arrivals list.

Status: No change since 109th check (Tue 18 Aug).

Evidence (live DB, 19 Aug 2026)
- Stale active Booking Courses (endDate < 19 Aug 2026): 24,497 -- unchanged
- Most recently ended stale: IDs 1591, 1344, 1305, 24, 1572 -- all ended 14 Aug 2026 (5 days ago)
- Fix script prepared; bulk deactivation not yet run

Fix Recipe -- NOT YET RUN
See issue-45-addendum-18aug.md for the prepared bulk deactivation script.

Risk: Medium. Reversible. High volume (24,497 rows). Test on subset first.
Status: Fix NOT RUN. Last checked: Wed 19 Aug 2026 UTC (110th check).