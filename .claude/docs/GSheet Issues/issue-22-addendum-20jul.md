# Issue 22 addendum — Mon 20 Jul 2026 (43rd check, 16th hourly)

Student: Edith Nunes (Edith in SIS) | Student 1015 | Booking 1567 | Sheet row 23

## Current status (fresh DB Mon 20 Jul 2026 UTC)

- Booking course 24991 (General English AM, 13 Jul to 7 Aug 2026): STILL 0 class assignments
- Week 1 (Mon 13 Jul to Fri 17 Jul): permanently missed — 5 school days gone
- Week 2 day 1 (Mon 20 Jul): assign immediately; 13 school days remain (ends 7 Aug)
  Note: Aug 3 Bank Holiday not in school_closures (Issue 38) — effective remaining is 12 once fixed
- Booking course 24933 (General English AM, 15 Jun to 10 Jul 2026): STILL active = true — 10 days stale
- Booking course 24934 (General English AM, 15 Jun to 10 Jul 2026): STILL active = true — 10 days stale

## Fix recipe (NOT YET RUN)

1. SIS Admin → Booking 1567 (Edith Nunes) → BC24991 → Assign to a GE AM class
2. Set active = false on BC24933 (ended 10 Jul 2026)
3. Set active = false on BC24934 (ended 10 Jul 2026)

## Risk
Class assignment — reversible. Stale BCs: data-hygiene — reversible.

## Status
OPEN. Week 2 started Mon 20 Jul. Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC (43rd check, 16th hourly).