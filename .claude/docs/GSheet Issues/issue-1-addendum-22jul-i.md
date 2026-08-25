# Issue 1 Addendum Wed 22 Jul 2026 run i (100th total check milestone)

Area: Cleanup | Sheet row 2

## Root cause
4 payments with booking_id = null:
- PMT4781: EUR 380, Flywire, Aug 2019, FIDELO legacy record, permanently unresolvable.
- PMT16988: EUR 339.90, Bank (one_time_or_initial), created 28 Apr 2026, xero_id null, 86 days unlinked.
- PMT16989: EUR 339.90, Bank (one_time_or_initial), created 28 Apr 2026, xero_id null, 86 days unlinked.
- PMT17187: EUR 6151, TransferMate Escrow, created 1 May 2026, xero_id null, 83 days unlinked.
Stale booking courses (active=true, end_date < 22 Jul 2026): 24,436 unchanged.
Stale booking accommodations (active=true, end_date < 22 Jul 2026): 11,175 unchanged.

## Fix recipe (NOT YET RUN)
1. Investigate PMT16988 and PMT16989: find the matching student/booking in HubSpot by EUR 339.90 Bank payments around 28 Apr 2026. Link booking_id.
2. Investigate PMT17187: find matching TransferMate escrow for EUR 6151 around 1 May 2026. Link booking_id.
3. PMT4781: Mark as permanently unresolvable (FIDELO 2019 legacy). Document in DB comment field.
4. Run stale-deactivation job for BCs and BAs: UPDATE booking_courses SET active=false WHERE active=true AND end_date < NOW(); (same for booking_accommodations). Review impact first.

## Risk
Money (orphan payments), data-hygiene. Reversible for deactivation. Blast radius: 4 payments + 35,611 stale records.

## Status
OPEN 44th hourly check 100th total check (milestone). Fix NOT RUN.
Last checked: Wed 22 Jul 2026 UTC
