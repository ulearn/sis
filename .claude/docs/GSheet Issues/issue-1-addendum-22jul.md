# Issue 1 Addendum 22 Jul 2026
Reporter: NM | Row: 2 | 34th hourly (90th total) Wed 22 Jul UTC

## Root Cause
Orphan payments - UNCHANGED:
- Payment 16988: EUR 339.90 Bank Apr28 - bookingId null - 85d
- Payment 16989: EUR 339.90 Bank Apr28 - bookingId null - 85d
- Payment 17187: EUR 6151 TransferMate Escrow May1 - bookingId null - 82d
- Payment 4781: EUR 380 Flywire Aug2019 - bookingId null - legacy
Stale BCs: 24,436 active past end (UNCHANGED)
Stale BAs: 11,175 active past end (UNCHANGED)

## Fix Recipe (NOT YET RUN)
1. Link pmt 16988 to correct booking (identify via HubSpot): UPDATE payment SET booking_id=<id> WHERE id=16988;
2. Link pmt 16989 similarly
3. Link pmt 17187 (EUR 6151 TransferMate) to correct booking
4. Confirm fate of legacy pmt 4781 (link or write off)
5. Deactivate stale BCs: UPDATE booking_course SET active=false WHERE active=true AND end_date<'2026-07-22';
6. Deactivate stale BAs: UPDATE booking_accommodation SET active=false WHERE active=true AND end_date<'2026-07-22';

## Risk
category: money/data-hygiene | reversible: yes | blast radius: 4 pmts + 24k BCs + 11k BAs

## Status
OPEN - fix NOT YET RUN. Last checked: Wed 22 Jul 2026 UTC
