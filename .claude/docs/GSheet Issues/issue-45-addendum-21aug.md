# Issue 45 Addendum 21 Aug 2026 (Evening) — 24,497 Stale Booking Courses

Reporter: KC | Area: Renewal students | Sheet row: 47

Root cause (119th check, Fri 21 Aug 2026 evening — no change since 118th afternoon):

- Stale active Booking Courses (endDate before 2026-08-21): 24,497 — unchanged
- Impacts arrivals list: renewal students with stale active Booking Courses do not appear
- Fix NOT RUN

Fix recipe (NOT YET RUN):

Preview (dry run — count only):
  SELECT COUNT(*) FROM booking_course WHERE active = true AND "endDate" < NOW();
  Expect: approximately 24,497

Bulk deactivation:
  UPDATE booking_course SET active = false, "updatedAt" = NOW()
    WHERE active = true AND "endDate" < NOW();

Verify:
  SELECT COUNT(*) FROM booking_course WHERE active = true AND "endDate" < NOW();
  Expect: 0

Risk: bookings | Reversible: yes (SET active = true WHERE ...) | Blast radius: 24,497 rows
Impact: Arrivals list will correctly exclude students whose course has ended.
Status: Fix NOT RUN. Last checked: 2026-08-21 Fri evening (119th check)
