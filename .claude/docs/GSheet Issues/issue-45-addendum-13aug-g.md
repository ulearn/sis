# Issue 45 — Stale Booking Courses / Renewal Arrivals — Addendum 13 Aug 2026 (g)

Sheet row 47 | Check 83rd | 249th global run ~18:xx UTC

No change in stale count since 82nd check (17:03 UTC today). Live BCs +2.

- Stale active BCs (endDate < 2026-08-13, active=true): 24,479 — unchanged
- Live BCs (endDate >= 2026-08-13, active=true): 285 (+2 since 82nd check at 283)

Fix (NOT YET RUN — requires explicit approval):
  SELECT COUNT(*) FROM BookingCourse WHERE active=true AND end_date < CURRENT_DATE;
  -- Dry run: sample 10 rows first
  UPDATE BookingCourse SET active=false WHERE active=true AND end_date < CURRENT_DATE;
  -- ~24,479 rows. Reversible. Verify arrivals list immediately after.

Status: Open. 24,479 stale BCs (unchanged). Live: 285 (+2). Fix NOT RUN.
Last checked: 2026-08-13 ~18:xx UTC
