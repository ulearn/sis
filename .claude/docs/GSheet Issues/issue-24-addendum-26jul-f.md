# Issue 24 — Alberto Squillace: BC24686 Still 0 SCAs (115th check, 26 Jul 2026 f)

Sheet row: 25. Student in booking 1611.

## Root cause (26 Jul 2026 UTC)
- BC 24686 (Morning General, Jul 20-Sep 18 2026): active=true, fee=null, 0 class assignments
- BC 1797 (Morning General, ended Jun 26 2026): active=true, 30 days stale
- Week 1 (Jul 21-25) missed — 5 school days lost
- Week 2 starts Mon 27 Jul 2026 tomorrow

## Fix — NOT YET RUN
1. Assign BC 24686 to Morning General class starting Mon 27 Jul
2. Set fee on BC 24686 (check HubSpot deal for correct amount)
3. Set active=false on BC 1797 (stale)

## Risk
bookings/attendance/data-hygiene; reversible.

## Status
URGENT. Week 2 starts tomorrow Mon 27 Jul. Fix NOT RUN.
Last checked: 26 Jul 2026 UTC (115th hrly)
