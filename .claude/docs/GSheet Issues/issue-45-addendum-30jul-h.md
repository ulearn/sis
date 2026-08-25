# Issue 45 — 76 Stale Booking Courses (5th check Thu 30 Jul 2026 UTC)

Reporter: AC | Area: Renewal Students/Class Assignment | Sheet row: 47

## Root Cause
Thu 30 Jul 2026 fresh count:
- 60 stale BCs: active=true, end_date 2026-07-03 to 2026-07-24 (all past).
- 16 BCs ending tomorrow Jul 31: IDs 87,1347,1454,1502,1503,1723,24609,24616,
  24945,24987,24998,25008,25017,25019,25021,25023
- Total: 76. Count unchanged from 30jul-g.
- Includes BC24933+BC24934 (Edith Nunes bk18158) and BC24630+BC24631 (Fassina/Galbusera).

## Full ID List
Jul 3 (12): 18,1417,1530,1604,1616,1787,24664,24696,24775,24838,24888,24941
Jul 10 (18): 103,1455,1615,1650,1653,1697,1773,24630,24631,24670,24872,24907,
             24931,24933,24934,24936,24937,24968
Jul 17 (19): 7,26,95,1294,1669,1681,1708,1718,1719,1737,1765,1770,1771,
             24946,24960,24985,24986,24992,24994
Jul 24 (11): 20,37,81,1781,1792,24606,24620,24776,24828,24989,25011

## Fix Recipe (NOT YET RUN)

Step 1 — Deactivate 60 already-stale BCs:
  UPDATE booking_courses SET active=false, updated_at=NOW()
  WHERE id IN (
    18,1417,1530,1604,1616,1787,24664,24696,24775,24838,24888,24941,
    103,1455,1615,1650,1653,1697,1773,24630,24631,24670,24872,24907,
    24931,24933,24934,24936,24937,24968,
    7,26,95,1294,1669,1681,1708,1718,1719,1737,1765,1770,1771,
    24946,24960,24985,24986,24992,24994,
    20,37,81,1781,1792,24606,24620,24776,24828,24989,25011
  ) AND active=true;

Step 2 — Deactivate 16 ending Jul 31 (run on or after Jul 31):
  UPDATE booking_courses SET active=false, updated_at=NOW()
  WHERE id IN (87,1347,1454,1502,1503,1723,24609,24616,
               24945,24987,24998,25008,25017,25019,25021,25023)
    AND active=true;

  Verify: SELECT COUNT(*) FROM booking_courses WHERE active=true AND end_date<'2026-08-01'; -- expect 0

## Risk / Category
Data hygiene — reversible. Blast radius: 76 course records across many students.

## Status
NOT RUN. 5th check Thu 30 Jul 2026 UTC (30jul-h). 60 stale + 16 ending tomorrow = 76 total.