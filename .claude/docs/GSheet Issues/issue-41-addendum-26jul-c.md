# Issue 41 — Giampaolo Russo (Addendum 26 Jul 2026 C) — Capel BA Missing, Check-in 7d

Reporter: Diego/AC | Area: Booking / Accomm | Sheet row: 43

## Root cause (verified Sun 26 Jul 2026 UTC — run 109)
- Booking 18180: CONFIRMED, EUR 2,584.96 fully paid (payment 17954, xeroPaymentId = null, 31d unreconciled)
- Booking accommodation 11357 (Aug 2–Sep 6, bed 178, host family, EUR 1,250): active = true — present and correct
- Capel Street accommodation (Sep 6–Sep 14): MISSING — only 1 BA on booking 18180
- Capel BA fee estimate: EUR 2,584.96 - EUR 1,250 - course fee = unaccounted portion suggests ~EUR 530
- Booking course 24956 (General English AM, Aug 3–Sep 11): starts Aug 3 Bank Holiday — will be shunted by issue-38 fix
- Host family check-in: Aug 2 = 7 calendar days away

## Fix recipe (NOT YET RUN)
Step 1: Create Capel Street BA via SIS admin:
  Booking 18180 → Accommodation → Add:
  Property: Capel Street | Start: 2026-09-06 | End: 2026-09-14 | Fee: EUR 530 (confirm with KC/Diego) | Active: true
Step 2: Reconcile payment 17954 (EUR 2,584.96) in Xero.
Step 3: Verify BC24956 shunted to 2026-08-04 after issue-38 fix runs.

## Risk
accommodation; reversible; check-in Aug 2 = 7 days; Xero unreconciled 31d

## Status
UNRESOLVED — Capel BA still missing. Fix NOT RUN. Last checked: Sun 26 Jul 2026 UTC (run 109)
