Issue 36b — Stale Booking Accommodations + Pietro Xero (142nd check, 2nd on Aug 3)
Sheet row: 38

Status: Mon 3 Aug 2026 UTC, 2nd check.

Fresh DB: active BAs with endDate < 2026-08-03 = 11,183.
Previous run cited 50 stale BAs (endDate <= 2026-08-02).

DISCREPANCY NOTE:
- Previous H: 50 stale BAs (end date <= Aug2, active=true, bed assigned).
- Fresh query (active=true, endDate < Aug3): 11,183.
- Difference likely: previous run used a narrower filter (e.g. BAs ending in last 90 days,
  or specific to migration-era records, or only BAs with a bed_id assigned).
- The 11,183 overlaps with Issue 45 scope (24,466 stale BCs — Neil decision pending).
- Pietro BA 11311 (bed 84, Jun28-Sep13 2026): active=true, endDate in future — NOT stale.
- Pietro course 24772 (General English AM, Jun29-Aug21): active, current (ends Aug21).
- Payment 17733 (bk17980): xeroPaymentId null — day 62+.
- Unchanged from 1st-today (issue-36b-addendum-3aug.md).

Question for Neil:
Is the 50-BA list a hand-picked specific set (from recipe), or a date-range filter?
If filter: what exact WHERE clause was used? The recipe uses end_date <= 2026-08-02 but that gives 11,183.

Fix recipe (NOT YET RUN):
1. If 50 specific BAs: run UPDATE as listed in issue-36b-addendum-3aug.md.
2. If broader scope: await Neil decision (link to Issue 45 bulk deactivation).
3. Reconcile payment 17733 (bk17980, Pietro) with Xero.

Risk: accommodations — reversible. Pietro BA 11311 is NOT stale.
Status: NOT RUN — 142nd check, 2nd Mon 3 Aug 2026 UTC.