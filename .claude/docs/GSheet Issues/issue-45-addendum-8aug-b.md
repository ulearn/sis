Issue 45 — Stale Booking Courses (Addendum, 8 Aug 2026 — b)
Reporter: AC | Area: Renewal students | Sheet row: 47 | 38th check Sat 8 Aug 2026 UTC

Root Cause (live data, 8 Aug 2026 UTC — NOT YET RUN)

Total stale active Booking Courses: 24,479 (unchanged from 37th check).

13 new Booking Courses became stale 7 Aug:
  BC 88 Africa Mera Bachir, BC 1673 Tungalag Davaasuren, BC 1672 Undralbat Ganbaatar
  BC 1740 Suvd-Erdene Baldorj, BC 1675 Zorigt Bayarsaikhan, BC 1742 Beatriz Venancio
  BC 24966 Filippo Corazzini, BC 24983 Erin Pastorelli + 5 more (ended 7-8 Aug)

Count growing daily (~13 new stale per school day). No deactivation run.

Fix Recipe (NOT YET RUN)

Bulk deactivation (when Neil approves):
  UPDATE booking_courses SET active = false
  WHERE active = true AND end_date < NOW();
  Estimated rows: ~24,479

Preview: SELECT COUNT(*) FROM booking_courses WHERE active=true AND end_date < NOW();

Risk: data-hygiene; reversible; medium blast radius (24k rows, flag only)
Status: OPEN — Awaiting Neil decision
Last checked: 2026-08-08 UTC (38th check)
