# Issue 45 - Stale Booking Courses / Renewal Students Not on Arrivals
Reporter: various | Area: Renewal students | Sheet row: 47
90th check Fri 14 Aug 2026 UTC

Symptom:
Returning/renewal students not appearing on arrivals list. Stale Booking Courses (active = true, end_date in past) block the arrivals query.

Root cause (verified):
- Active Booking Courses with end_date before 2026-08-14 (stale): 24,479
- Live Booking Courses (end_date >= 2026-08-14): 285
- No change since 89th check; count stable at 24,479 for many runs
- Hash change this run: edit to B column on sheet; BC data unchanged

Fix recipe (NOT YET RUN):
Run in stages to allow rollback. Verify arrivals list after each stage.

Stage 1 - deactivate oldest stale BCs (ended before 2025-01-01):
  UPDATE booking_courses SET active = false, updated_at = NOW()
  WHERE active = true AND end_date < '2025-01-01';

Stage 2 - deactivate 2025 stale BCs (ended before 2026-01-01):
  UPDATE booking_courses SET active = false, updated_at = NOW()
  WHERE active = true AND end_date < '2026-01-01' AND end_date >= '2025-01-01';

Stage 3 - deactivate 2026 stale BCs (ended before today):
  UPDATE booking_courses SET active = false, updated_at = NOW()
  WHERE active = true AND end_date < CURRENT_DATE AND end_date >= '2026-01-01';

All reversible (SET active = true).

Risk: bookings / data-hygiene. Reversible. Blast: up to 24,479 BC records. Staged approach limits rollback scope.
Status: Open - 24,479 stale Booking Courses. Fix NOT RUN.
Last checked: Fri 14 Aug 2026 UTC (90th check)
