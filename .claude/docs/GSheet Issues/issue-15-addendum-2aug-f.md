# Issue 15 — Saikhantes Shagdasuren (2 Aug 2026, check 17)

Reporter: AC | Area: Booking/Class | Sheet row: 16

## Root Cause (17th check — 2 Aug 2026 UTC)
- Holiday BA 18151: Jul 20-Aug 21 2026 — returns Mon 24 Aug 2026 (22 days).
- BC 24925 (AY Afternoon, Mar 9-Oct 2 2026): active. 1 SCA: id 255, class 11, weekEnd Jul 3 2026. 30 days since last.
- BC 1982 (AY Morning, Jun 30-Dec 19 2025): still active — ended 226 days ago.
- Aug BH does not affect Saikhantes (on holiday until Aug 24; BC starts Mar 9, not Aug 3).

## Fix Recipe — NOT YET RUN

Step 1: Deactivate stale BC 1982 (NOT YET RUN):
UPDATE booking_courses SET active = false WHERE id = 1982;

Step 2: Create SCA for week of Mon 24 Aug (NOT YET RUN):
SIS Class Assignment — BC 24925 (AY Afternoon), class 11, week start Mon 24 Aug 2026.

Step 3: Verify attendance tracking from Aug 24.

## Risk: bookings | Reversible | Blast radius: 1 student; not urgent until Aug 24
## Status: Open — returns Mon 24 Aug 2026 (22 days)
Last checked: 2 Aug 2026 UTC (check 17, 9th today)