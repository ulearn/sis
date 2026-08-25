## Issue 45 -- Stale Active Booking Courses (Renewal Arrivals)
Reporter: AC | Sheet row: 47

## Root cause (Thu 30 Jul 2026 UTC -- 4th check today)
- 76 booking_course rows active=true with end_date in Jul 2026
- 60 already past end date today (Jul 3 / Jul 10 / Jul 17 / Jul 24 batches)
- 16 end tomorrow Jul 31 -- will be stale tomorrow morning
- Fix NOT RUN

### Jul 31 batch -- 16 BCs ending tomorrow
BC 87     Intensive General 30           -- bk 82
BC 1347   Academic Year Afternoon        -- bk 1305
BC 1454   Academic Year Afternoon        -- bk 1368
BC 1502   Academic Year Renewal Morning  -- bk 1396
BC 1503   Academic Year Afternoon        -- bk 1397
BC 1723   Academic Year Renewal Afternoon -- bk 1546
BC 24609  Morning General                -- bk 17831
BC 24616  General English AM Plus        -- bk 17842
BC 24945  General English AM             -- bk 18169
BC 24987  General English AM Plus        -- bk 18210
BC 24998  General English PM             -- bk 18221
BC 25008  General English AM Plus        -- bk 18230
BC 25017  General English AM             -- bk 18239
BC 25019  General English PM             -- bk 18241
BC 25021  General English PM             -- bk 18243
BC 25023  General English PM             -- bk 18245 (Eduardo Roche Diaz)

### Prior batches (all stale)
Jul 3 (12):  BC18, BC24664, BC24696, BC24775, BC24838, BC24888, BC24941, BC1417, BC1530, BC1604, BC1616, BC1787
Jul 10 (18): BC103, BC1455, BC1615, BC1650, BC1653, BC1697, BC1773, BC24630, BC24631, BC24670, BC24872, BC24907, BC24931, BC24933, BC24934, BC24936, BC24937, BC24968
Jul 17 (19): BC7, BC26, BC95, BC1294, BC1669, BC1681, BC1708, BC1718, BC1719, BC1737, BC1765, BC1770, BC1771, BC24946, BC24960, BC24985, BC24986, BC24992, BC24994
Jul 24 (11): BC20, BC37, BC81, BC1781, BC1792, BC24606, BC24620, BC24776, BC24828, BC24989, BC25011

## Fix recipe -- NOT YET RUN

Run on or after Jul 31 to catch all 76:
  UPDATE booking_courses
  SET active = false
  WHERE active = true
    AND end_date >= '2026-07-01'
    AND end_date <= '2026-07-31';
  Expected: 76 rows

If running today (Jul 30) only -- deactivate the 60 already past:
  UPDATE booking_courses
  SET active = false
  WHERE active = true
    AND end_date >= '2026-07-01'
    AND end_date < '2026-07-30';
  Expected: 60 rows -- then run the Jul 31 batch tomorrow.

Verify:
  SELECT COUNT(*) FROM booking_courses
  WHERE active = true AND end_date >= 2026-07-01 AND end_date <= 2026-07-31;

## Risk
Data hygiene -- reversible; 76 BCs across approx 60 students; no financial impact.

## Status
Fix NOT RUN. Count: 60 stale now, 76 by end of Jul 31.
Last checked: Thu 30 Jul 2026 UTC (4th check today -- grew from 60 to 76 with Jul 31 batch)