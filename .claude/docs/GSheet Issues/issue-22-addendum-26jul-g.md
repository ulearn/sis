# Issue 22 — Edith Nunes: BC24991 Still 0 SCAs (115th check, 26 Jul 2026 g)

Sheet row: 23. Student in booking 18214.

## Root cause (26 Jul 2026 UTC)
- BC 24991 (General English AM, Jul 13-Aug 7 2026): active=true, 0 class assignments
- BC 24933 (ended Jul 10): active=true, 16 days stale
- BC 24934 (ended Jul 10): active=true, 16 days stale
- 10 school days missed (weeks Jul 13-24) — irrecoverable
- Window opens Mon 27 Jul: 9 school days remain (5 this week + 4 next; Aug 3 bank holiday, so Aug 4-7)

## Fix — NOT YET RUN
1. Assign BC 24991 to appropriate General English AM class starting Mon 27 Jul
2. Set active=false on BCs 24933 and 24934 (stale cleanup)

## Risk
bookings/attendance; reversible; window closes Aug 7.

## Status
CRITICAL. Window opens Mon 27 Jul. Fix NOT RUN.
Last checked: 26 Jul 2026 UTC (115th hrly)
