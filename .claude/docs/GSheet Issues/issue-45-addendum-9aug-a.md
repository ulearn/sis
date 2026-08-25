Issue 45 (45th check Sun 9 Aug 2026) -- Sheet row 47

Stale booking courses (active=true, end_date before 9 Aug 2026): 24,479 -- unchanged from 44th check
14 booking courses ended Aug 3-8 (included in total). 0 new ends on Sunday 9 Aug.

Fix recipe (NOT YET RUN):
  -- Preview:
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;
  -- Deactivate:
  UPDATE booking_courses SET active = false WHERE active = true AND end_date < CURRENT_DATE;
  Run off-peak. Verify sample before/after.

Risk: Data hygiene. Reversible. Blast: ~24,479 rows, all historical.
Status: NOT RUN | Last checked: 2026-08-09 UTC (45th check, 24,479 stale)
