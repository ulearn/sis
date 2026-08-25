Issue 36b -- Stale Booking Accommodations (addendum Sat 25 Jul 2026 UTC)

Sheet row: 38 | Area: Booking / Accomm

Current state (Sat 25 Jul 2026 UTC):
Stale BAs (active=true, endDate < now, bedId not null): 43

Corrects prior run (same day, Sat 25 Jul) which wrote 47 stale BAs; +4 today.
Current DB count is 43 -- same as Friday 24 Jul.
The 4 extra may have been deactivated intra-day by staff, or the earlier count was erroneous.

6 most recently updated stale BAs:
  BA 11365 | BK 18184 | bed 174 | ended Jul 18 | updated Jul 6
  BA 11167 | BK 93    | bed 168 | ended Jul 4  | updated Jul 6
  BA 11247 | BK 17    | bed 161 | ended Jul 4  | updated Jul 6
  BA 11285 | BK 17825 | bed 83  | ended Jul 5  | updated Jul 6
  BA 11257 | BK 7     | bed 168 | ended Jul 18 | updated Jul 1
  BA 11352 | BK 18156 | bed 83  | ended Jul 11 | updated Jun 29

No new stale BAs since previous check. No change needed.

Status: STABLE -- 43 stale BAs (correcting earlier 47)
Last checked: Sat 25 Jul 2026 UTC
