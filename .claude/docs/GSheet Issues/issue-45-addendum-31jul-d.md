# Issue 45 — Stale Booking Courses / Renewal Arrivals (12th check Fri 31 Jul 2026)

Reporter: AC | Area: Renewal Students | Sheet row: 47

## Status: B column cleared in sheet; total count unchanged at 24,449

## Evidence (live DB)

- Total active booking courses ended before Jul 31 2026: 24,449 — unchanged
- Named recipe subset (27 booking courses): all still active = true (live query confirmed)
- B column in sheet was cleared (previously had student names) — may be intentional staff edit

## Recipe correction — Booking course 1791 is not stale

Booking course 1791 (Ariunsarnai Batbayar, Renewal AY Morning) ends 2026-10-23 (future date).
It appeared in prior check queries alongside stale booking courses erroneously.
Do NOT include booking course 1791 in any deactivation run.

## Fix recipe (NOT YET RUN)

Option A (targeted, safe): Deactivate the 27 named booking courses per prior recipe (issue-45-addendum-31jul-c.md).

Option B (bulk — Neil must approve before running):
  UPDATE booking_courses SET active = false WHERE end_date < CURRENT_DATE AND active = true;
  Blast radius: 24,449 records. Reversible via SET active = true.

## Risk: Data hygiene — reversible. Option B needs explicit Neil approval.
## Last checked: Fri 31 Jul 2026 UTC (12th check)
