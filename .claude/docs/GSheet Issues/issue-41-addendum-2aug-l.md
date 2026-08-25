# Issue 41 — Giampaolo Russo (2 Aug 2026, check 59)

Reporter: Diego+staff | Area: Booking/Accommodation | Sheet row: 43

## Root Cause (59th check — 2 Aug 2026 UTC)
- Student 14571 (Giampaolo Russo): arrived today 2 Aug 2026.
- BC 24956 (General English AM, Aug 3-Sep 11): active, fee EUR 804.96, 0 SCAs.
  BC 24956 in Aug BH shunt list (Issue 38) — once fix runs, start_date -> 2026-08-04.
  First class: Tue 4 Aug 2026.
- BA 11357 (bed 178, host family, Aug 2-Sep 6, EUR 1,250): active.
- Capel Street BA (Sep 6-Sep 14): absent from DB. Neil to confirm bed + fee.
- Payment 17954 (EUR 2,584.96, 26 Jun 2026): xeroPaymentId = null — 37 days unreconciled.

## Fix Recipe — NOT YET RUN

Step 1: Confirm Issue 38 fix runs first (BH closure + BC 24956 start_date -> 2026-08-04).

Step 2: Create SCA for BC 24956 (NOT YET RUN):
SIS Class Assignment for student 14571 — BC 24956, appropriate AM class, week start Tue 4 Aug 2026.

Step 3: Add Capel Street BA once Neil confirms bed + fee (Sep 6-Sep 14).

Step 4: Reconcile payment 17954 in Xero. Update xeroPaymentId on payment 17954.

## Risk: bookings | Reversible | Blast radius: 1 student; first class Tue 4 Aug
## Status: URGENT — Student arrived today; first class Tue 4 Aug
Last checked: 2 Aug 2026 UTC (check 59, 14th today)