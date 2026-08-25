# Issue 45 Addendum 21 Aug 2026 (Late Morning UTC) — Stale Booking Courses / Renewal Arrivals

Reporter: AC | Area: Renewal students | Sheet row: 47

Symptom: Returning students with renewed courses not appearing on arrivals list.

Root cause (121st check, Fri 21 Aug 2026 late morning UTC):
- Stale active Booking Courses (end_date < now, active = true): 24,515 — up 18 from 24,497 this morning.
- Renewal students with stale active Booking Courses do not appear on the arrivals list correctly.
- The count is trending upward as more course-end dates pass without deactivation.

Fix recipe (NOT YET RUN):

Step 1 — Preview the stale Booking Courses before deactivating:
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < NOW();
  -- Expect: ~24,515

Step 2 — Deactivate all stale Booking Courses in bulk:
  UPDATE booking_courses SET active = false, updated_at = NOW()
  WHERE active = true AND end_date < NOW();

Step 3 — Verify:
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < NOW();
  -- Expect: 0 (or near 0 for recently ended)

Risk: data-hygiene | Reversible: yes (can re-activate if needed) | Blast radius: ~24,515 rows
Status: Fix NOT RUN.
Last checked: 2026-08-21 Fri late morning UTC (121st check)
