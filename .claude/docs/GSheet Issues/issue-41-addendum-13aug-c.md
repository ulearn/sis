# Issue 41 — Giampaolo Russo / BA 11392 bed unassigned (13 Aug c)

Reporter: KC | Sheet row: 43 | Last checked: 2026-08-13 UTC (60th hourly check)

## Root cause
- BA 11392 (Giampaolo Russo, 6-14 Sep 2026): bed_id=null, fee=EUR 415, active=true
- BA 11357 (host family, 2 Aug - 6 Sep 2026): bed 178, active=true — correct
- Check-in for Capel stay: 24 days away (Sep 6)
- Available apartment beds Sep 6-14 (0 conflicts):
    Bed 168 — A1/Room 1, property A1 (Capel-area apartment)
    Bed 194 — Arasain-1, property Arasain (apartment)
    Bed 177 — Home/B9.2 (host family, not apartment)
- Bed 88 (A2/Room 3): occupied Sep 6-13 by BA 11393 (Pietro Caccianiga) — NOT available

## Fix recipe (NOT YET RUN)
Step 1: Assign bed to BA 11392:
  Via SIS admin: Accommodation > Giampaolo Russo > BA 11392 > assign bed 168 or 194
  DB: UPDATE booking_accommodations SET bed_id = 168 WHERE id = 11392; (or 194 for Arasain)
Step 2: Verify no BA conflicts on chosen bed during 2026-09-06 to 2026-09-14.

## Status
Open — bed null (day 60). Beds 168 + 194 available. Fix NOT RUN.
Last checked: 2026-08-13 UTC (60th hourly check)