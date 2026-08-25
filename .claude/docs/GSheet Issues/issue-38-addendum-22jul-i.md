Issue 38 Addendum 22 Jul 2026 (i)
48th hourly check Wed 22 Jul 2026 UTC (121st total). UNCHANGED.

DB query schoolClosure startDate 20 Jul-1 Sep 2026: 0 rows.
Aug Bank Holiday Mon 3 Aug 2026: STILL absent - 12 days away - URGENT
Oct Bank Holiday Mon 27 Oct 2026: STILL absent - 96 days away

Fix recipe (NOT YET RUN):
INSERT INTO school_closure (name, startDate, endDate, isPaidHoliday, createdAt) VALUES
  (August Bank Holiday, 2026-08-03, 2026-08-03, true, NOW()),
  (October Bank Holiday, 2026-10-27, 2026-10-27, true, NOW());
Then recompute end dates for affected booking courses.

Risk: school closures, course dates, reversible, affects all AY+long courses spanning Aug 3 or Oct 27
Last checked: Wed 22 Jul 2026 UTC