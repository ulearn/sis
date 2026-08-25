# Issue 12 — Stale BAs Massimiliano Cameran (Addendum 28 Jul 2026)
Reporter: Staff. Sheet row 13. Last checked: Tue 28 Jul 2026 UTC (110th hourly run).

## Root cause (fresh Tue 28 Jul 2026)
3 stale active BAs:
- BA 11162: HF bed=179, booking 97, ended 23 May 2026 — 66d stale
- BA 11314: HF bed=179, booking 18002, ended 6 Jun 2026 — 52d stale
- BA 11319: Apartment bed=null, zero-duration, ended 31 May 2026, fee=EUR 400 — 58d stale

## Fix recipe (NOT YET RUN)
1. Verify BA 11319 EUR 400 fee before deactivating.
2. Deactivate: UPDATE booking_accommodations SET active=false, updated_at=NOW() WHERE id IN (11162, 11314, 11319);

## Risk
Data hygiene. Low risk. Reversible. Previous: issue-12-addendum-26jul.md.