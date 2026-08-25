# Issue 41 — Giampaolo Russo (student 14571) — Capel BA Missing

Reporter: Diego/AC | Area: Booking / Accomm | Sheet row: 43

## Symptom
Student booked host family (Aug 2-Sep 6) and Capel Street (Sep 6-Sep 14). Capel is missing from SIS.

## Root cause (verified Sun 26 Jul 2026 UTC — run 107)
- Booking 18180: CONFIRMED, EUR 2,584.96 fully paid
- Booking accommodation 11357 (Aug 2-Sep 6, bed 178, host family, EUR 1,250): active = true — correct
- Capel Street accommodation (Sep 6-Sep 14): MISSING — only 1 BA on booking 18180
- Fee breakdown: 2,584.96 - 1,250 - 804.96 = EUR 530 unaccounted (Capel fee)
- Booking course 24956 (General English AM, Aug 3-Sep 11): starts Aug 3 BH — shunted by issue-38 fix
- Payment 17954 (EUR 2,584.96, Jun 26 2026): xeroPaymentId = null — 31 days unreconciled
- Host family check-in: Aug 2 = 7 calendar days away

## Fix recipe (NOT YET RUN)

Step 1 — Create Capel Street booking accommodation via SIS admin:
  Booking 18180 -> Accommodation -> Add:
  Property: Capel Street | Start: 2026-09-06 | End: 2026-09-14 | Fee: EUR 530 | Active: true

Step 2 — Reconcile payment 17954 in Xero (EUR 2,584.96, booking 18180).

Step 3 — Verify BC24956 shunted from 2026-08-03 to 2026-08-04 by issue-38 fix.

## Risk
Accommodation. Host family check-in Aug 2 = 7 days. Capel missing = no bed Sep 6-14. Xero null. Reversible.

## Status
UNRESOLVED — Capel BA still missing. Xero null 31d. Fix NOT RUN.

Last checked: Sun 26 Jul 2026 UTC (run 107)