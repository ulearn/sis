# Issue 43 — Jesus Ramirez: 5 Stale BAs on Bed 83 (52nd check Fri 21 Aug 2026)

**Reporter:** ST | **Area:** Booking / Accomm | **Sheet row:** 45
**See also:** Issue 37 (row 39) — same bed 83

## Root Cause (live DB, Fri 21 Aug 2026)

5 stale active BAs on bed 83 (all unchanged):
- BA 11239 (bk22): ended 24 May — 89 days stale, fee EUR 1,050
- BA 11168 (bk92): ended 20 Jun — 62 days stale, fee EUR 700
- BA 11285 (bk17825): ended 5 Jul — 47 days stale, fee = null
- BA 11352 (bk18156): ended 11 Jul — 41 days stale, fee EUR 360
- BA 11179 (bk82): ended 9 Aug — 12 days stale, fee EUR 1,360
Current: BA 11173 (bk88, 9 Aug to 30 Aug, EUR 1,080)
Next: BA 25 (bk17844, starts 30 Aug, 9 days, EUR 2,100)

## Fix Recipe (NOT YET RUN)

1. Set fee on BA 11285: UPDATE booking_accommodation SET fee = 2008 WHERE id = 11285 AND fee IS NULL
   (bk17825 CONFIRMED fully paid EUR 2,008)
2. Deactivate 5 stale BAs: UPDATE booking_accommodation SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179)

## Risk
- Category: accommodation + data-hygiene | Reversible | Low blast radius
- Next occupant arrives 30 Aug (9 days) — fix before then

## Status
5 stale BAs unchanged. Fix NOT RUN.
**Last checked:** 2026-08-21 UTC (52nd check)