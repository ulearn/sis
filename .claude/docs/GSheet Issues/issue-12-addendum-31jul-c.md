Issue 12 Addendum  31 Jul 2026 (c)  3 Stale BAs: All Unchanged
Reporter: Antonella  Area: Booking / Accomm  Sheet row: 13
Last checked: 2026-07-31 UTC (117th hourly check)

CURRENT DB STATE (this run)
- BA 11162 (bk97 Massimiliano Cameran, bed 179 host family, Apr 21-May 23): active=true, fee=EUR 1140 -- 69 days stale
- BA 11314 (bk18002 Massimiliano Cameran, bed 179 host family, May 23-Jun 6): active=true, fee=EUR 480 -- 55 days stale
- BA 11319 (bk18034, May 31-May 31): active=true, fee=EUR 400, bed_id=null -- 61 days stale (zero-duration)
All 3 unchanged from all prior checks.

FIX RECIPE (NOT YET RUN)
Deactivate all 3 stale booking accommodations:
  UPDATE booking_accommodations SET active = false
  WHERE id IN (11162, 11314, 11319);

Note: BA 11319 has bed_id = null and zero duration (May 31-May 31). Safe to deactivate.

RISK / CATEGORY
- Category: data-hygiene / accomm
- Reversible: yes (SET active = true to restore)
- Blast radius: 3 records, cosmetic only, frees bed 179 from stale assignments

STATUS
NOT RUN. 117th hourly check (Fri 31 Jul 2026). All 3 unchanged. Low priority.