## Issue 45 — Stale Active Booking Courses (Renewal Arrivals)
Reporter: AC | Sheet row: 47

## Root cause (Thu 30 Jul 2026 UTC — 3rd check today)
• 60 booking_course rows active=true, end_date in Jul 2026 (before Jul 30)
• Previous H: 27 BCs — count grew by 33 (Jul 3 and Jul 10 batches now included)
• BC25023 (Eduardo Roche Diaz) ends tomorrow 2026-07-31 — will join stale list
• Fix NOT RUN

### Full 60 BCs
Jul 3 (12): BC24664 BC24888 BC1616 BC1787 BC24941 BC24838 BC24775 BC24696 BC1417 BC18 BC1530 BC1604
Jul 10 (18): BC24934 BC103 BC1455 BC1653 BC1697 BC1773 BC1650 BC1615 BC24631 BC24630 BC24670 BC24872 BC24933 BC24936 BC24937 BC24931 BC24907 BC24968
Jul 17 (19): BC1294 BC1681 BC1718 BC24986 BC1771 BC1770 BC24960 BC26 BC1669 BC24992 BC1719 BC95 BC24946 BC7 BC24994 BC1765 BC1708 BC1737 BC24985
Jul 24 (11): BC20 BC24989 BC81 BC24776 BC24828 BC25011 BC24620 BC1781 BC1792 BC37 BC24606

## Fix recipe — NOT YET RUN

Deactivate all 60:
UPDATE booking_courses SET active = false
  WHERE active = true AND end_date >= 2026-07-01 AND end_date < 2026-07-30;
  (expected 60 rows)

BC25023 on/after Jul 31:
UPDATE booking_courses SET active = false WHERE id = 25023;

Verify:
SELECT COUNT(*) FROM booking_courses
  WHERE active = true AND end_date < 2026-07-31 AND end_date >= 2026-07-01;
  (should be 0)

## Risk
Data hygiene — reversible; 60 BCs / ~50 students; no financial impact

## Status
Fix NOT RUN. 60 stale (was 27). BC25023 stale tomorrow.
Last checked: Thu 30 Jul 2026 UTC