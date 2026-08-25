Issue 45 -- Stale Booking Courses (113th check, 20 Aug 2026)
Sheet row: 47 | Reporter: NM | Area: Renewal students

Symptom
Renewal students not appearing on arrivals list.

Root Cause (evidence, 20 Aug 2026)
- Stale active Booking Courses (endDate < 20 Aug 2026): 24,497 -- unchanged from Wed 19 Aug
- Most recently ended stale: IDs 1591, 1344, 1305, 24, 1572 -- all ended 14 Aug 2026 (now 6 days stale)
- Fix script prepared; bulk deactivation NOT YET RUN

Fix Recipe -- NOT YET RUN
See issue-45-addendum-18aug.md for the prepared bulk deactivation script.

Steps (do NOT run without reviewing the earlier recipe):
1. Run the bulk deactivation script on a subset first (100 rows) to verify no side-effects
2. Confirm arrivals list updates correctly
3. Run the full batch -- 24,497 rows

Risk / Category
- Category: bookings / data-hygiene
- Reversible: yes (set active = true again if needed)
- Blast radius: high volume (24,497 rows) -- test on subset first

Status
No change. Fix NOT RUN.
Last checked: Thu 20 Aug 2026 UTC (113th check)
