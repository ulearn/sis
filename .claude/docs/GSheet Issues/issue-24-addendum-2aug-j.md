# Issue 24 — Alberto Squillace (2 Aug 2026, check 33)

Reporter: AC | Area: Booking | Sheet row: 25

## Root Cause (33rd check — 2 Aug 2026 UTC)
- Booking 1611: CONFIRMED, amountPaid EUR 1,280.12, amountOpen EUR 0 — fully paid.
- BC 24686 (Morning General, Jul 20-Sep 18 2026): active, fee = null, 0 SCAs.
  start_date = Jul 20 — NOT in BH shunt list. Manual SCA needed for Tue 4 Aug.
- BC 1797 (Morning General, Apr 6-Jun 26 2026): still active — ended 37 days ago.
- Last SCA: id 229, class 12, weekEnd 2026-04-26 — 98 days with no assignment.

## Fix Recipe — NOT YET RUN

Step 1: Set fee on BC 24686 (NOT YET RUN):
Verify fee from HubSpot deal. Then: UPDATE booking_courses SET fee = <fee> WHERE id = 24686;

Step 2: Create SCA for BC 24686, week of Tue 4 Aug (NOT YET RUN):
SIS Class Assignment — BC 24686, class 12, week start Tue 4 Aug 2026.

Step 3: Deactivate stale BC 1797 (NOT YET RUN):
UPDATE booking_courses SET active = false WHERE id = 1797;

## Risk: bookings | Reversible | Blast radius: 1 student; resumes Tue 4 Aug
## Status: URGENT — Student resumes Tue 4 Aug 2026
Last checked: 2 Aug 2026 UTC (check 33, 13th today)