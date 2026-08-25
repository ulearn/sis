# Issue 22 — Edite Nunes (student 1015) — Penultimate Window Tomorrow

Reporter: AC | Area: Booking / Class | Sheet row: 23

## Root cause (verified Sun 26 Jul 2026 UTC)
- BC24991 (General English AM, Jul 13-Aug 7): active=true, 0 SCAs (confirmed fresh)
- BCs 24933+24934 (ended Jul 10): both active=true — 16 days stale
- BK18214: CONFIRMED, EUR 608/608
- 10 school days missed (Jul 14-25)
- Mon 27 Jul = penultimate window (9 school days remain: Jul 27-31=5, Aug 4-7=4)
- Aug 3 = Bank Holiday

## Fix recipe (NOT YET RUN)
1. Assign student 1015 to General English AM wb Mon 27 Jul (BC24991)
2. Deactivate BCs 24933+24934 (UPDATE booking_course SET active=false WHERE id IN (24933,24934))

## Status
UNRESOLVED — Penultimate window Mon 27 Jul 2026 (TOMORROW)

Last checked: Sun 26 Jul 2026 UTC (106th hourly run)